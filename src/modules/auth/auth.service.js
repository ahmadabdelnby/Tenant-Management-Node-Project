const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../../config/database');
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
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ? AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    
    if (users.length === 0) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }
    
    const user = users[0];
    
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
    await pool.execute(
      'INSERT INTO token_blacklist (token_jti, expires_at, created_at) VALUES (?, ?, NOW())',
      [tokenJti, expiresAt]
    );
    
    logger.info(`User logged out: ${userId}`);
    
    return true;
  },
  
  /**
   * Get current user profile
   * @param {number} userId - User ID
   * @returns {Object} - User data
   */
  async getCurrentUser(userId) {
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );
    
    if (users.length === 0) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    
    const user = users[0];
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },
};

module.exports = authService;
