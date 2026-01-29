const HTTP_STATUS = require('../constants/httpStatus');
const AppError = require('./AppError');

/**
 * Authorization Error Class
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

module.exports = AuthorizationError;
