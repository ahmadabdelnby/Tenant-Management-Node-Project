const logger = require('../shared/utils/logger');
const { AppError, ValidationError } = require('../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../shared/constants');
const config = require('../config');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });
  
  // Default error values
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = ERROR_MESSAGES.INTERNAL_ERROR;
  let errors = null;
  
  // Handle known errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    
    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.INVALID_TOKEN;
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  }
  
  // Handle MySQL errors
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Duplicate entry. Resource already exists.';
  }
  
  // Build response
  const response = {
    success: false,
    message,
    statusCode,
  };
  
  // Add errors array if present
  if (errors) {
    response.errors = errors;
  }
  
  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: HTTP_STATUS.NOT_FOUND,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
