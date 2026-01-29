const HTTP_STATUS = require('../constants/httpStatus');
const AppError = require('./AppError');

/**
 * Validation Error Class
 */
class ValidationError extends AppError {
  constructor(message = 'Validation Error', errors = []) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

module.exports = ValidationError;
