const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const { AppError, NotFoundError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants');
const { generateRandomPassword } = require('../../shared/utils/passwordGenerator');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

/**
 * User Service - Business logic
 */
const userService = {
  /**
   * Get all users with pagination
   */
  async getAllUsers(page, limit, filters) {
    const offset = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      userRepository.findAll(limit, offset, filters),
      userRepository.count(filters),
    ]);
    
    // Format users
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active === 1,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));
    
    return buildPaginationResponse(formattedUsers, page, limit, total);
  },
  
  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active === 1,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
  
  /**
   * Create new user (Admin only)
   */
  async createUser(userData) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
    }
    
    // Use provided password or generate random one
    const password = userData.password || generateRandomPassword(12);
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = await userRepository.create({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      passwordHash,
    });
    
    logger.info(`User created: ${userData.email} with ID: ${userId}`);
    
    // Return user with password info
    const response = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      message: 'User created successfully.',
    };
    
    // Only include temporary password if it was auto-generated
    if (!userData.password) {
      response.temporaryPassword = password;
      response.message = 'User created successfully. Please share the temporary password securely.';
    }
    
    return response;
  },
  
  /**
   * Update user (Admin only)
   */
  async updateUser(id, userData) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    // Check email uniqueness if being updated
    if (userData.email && userData.email.toLowerCase() !== user.email) {
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }
    }
    
    await userRepository.update(id, userData);
    
    logger.info(`User updated: ID ${id}`);
    
    return this.getUserById(id);
  },
  
  /**
   * Update own profile
   */
  async updateProfile(userId, profileData) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    await userRepository.update(userId, profileData);
    
    logger.info(`Profile updated: ID ${userId}`);
    
    return this.getUserById(userId);
  },
  
  /**
   * Deactivate user (Admin only)
   */
  async deactivateUser(id, currentUserId) {
    if (id === currentUserId) {
      throw new AppError(ERROR_MESSAGES.CANNOT_DEACTIVATE_SELF, HTTP_STATUS.BAD_REQUEST);
    }
    
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    await userRepository.deactivate(id);
    
    logger.info(`User deactivated: ID ${id}`);
    
    return { message: 'User deactivated successfully' };
  },
  
  /**
   * Activate user (Admin only)
   */
  async activateUser(id) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    await userRepository.activate(id);
    
    logger.info(`User activated: ID ${id}`);
    
    return { message: 'User activated successfully' };
  },
  
  /**
   * Soft delete user (Admin only)
   */
  async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      throw new AppError(ERROR_MESSAGES.CANNOT_DELETE_SELF, HTTP_STATUS.BAD_REQUEST);
    }
    
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    await userRepository.softDelete(id);
    
    logger.info(`User deleted: ID ${id}`);
    
    return { message: 'User deleted successfully' };
  },
};

module.exports = userService;
