const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, TokenBlacklist } = require('../../models');
const config = require('../../config');
const { AppError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../../shared/constants');
const logger = require('../../shared/utils/logger');

/**
 * Auth Service
 */
const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User data and token
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: ['id', 'email', 'password_hash', 'first_name', 'last_name', 'phone', 'role', 'is_active'],
    });
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if account is active
    if (!user.is_active) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_DEACTIVATED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Generate JWT token
    const jti = uuidv4();
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        jti,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    // Log successful login
    logger.info(`User logged in: ${user.email}`);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
      },
      token,
    };
  },
  
  /**
   * Logout user (blacklist token)
   * @param {string} tokenJti - JWT ID to blacklist
   * @param {number} userId - User ID for logging
   */
  async logout(tokenJti, userId) {
    // Calculate token expiration (1 hour from now to match JWT expiry)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    
    // Add token to blacklist
    await TokenBlacklist.create({
      token_jti: tokenJti,
      expires_at: expiresAt,
    });
    
    logger.info(`User logged out: ${userId}`);
    
    return true;
  },
  
  /**
   * Get current user profile
   * @param {number} userId - User ID
   * @returns {Object} - User data
   */
  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'updated_at'],
    });
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
};

module.exports = authService;
