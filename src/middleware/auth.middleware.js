const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, TokenBlacklist } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../shared/constants');
const logger = require('../shared/utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(ERROR_MESSAGES.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError(ERROR_MESSAGES.TOKEN_REQUIRED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
      }
      throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if token is blacklisted
    const blacklisted = await TokenBlacklist.findOne({
      where: {
        token_jti: decoded.jti,
        expires_at: { [Op.gt]: new Date() },
      },
    });
    
    if (blacklisted) {
      throw new AppError(ERROR_MESSAGES.TOKEN_BLACKLISTED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Check if user exists and is active
    const user = await User.findByPk(decoded.userId, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active'],
    });
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }
    
    if (!user.is_active) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_DEACTIVATED, HTTP_STATUS.UNAUTHORIZED);
    }
    
    // Attach user and token info to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    };
    req.tokenJti = decoded.jti;
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
