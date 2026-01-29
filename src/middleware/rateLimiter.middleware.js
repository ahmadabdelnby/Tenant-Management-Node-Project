const rateLimit = require('express-rate-limit');
const config = require('../config');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../shared/constants');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // 100 requests per window
  message: {
    success: false,
    message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login Rate Limiter (stricter)
 */
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.loginMax, // 5 attempts per window
  message: {
    success: false,
    message: ERROR_MESSAGES.TOO_MANY_LOGIN_ATTEMPTS,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

module.exports = {
  apiLimiter,
  loginLimiter,
};
