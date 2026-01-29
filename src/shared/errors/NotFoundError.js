const HTTP_STATUS = require('../constants/httpStatus');
const AppError = require('./AppError');

/**
 * Not Found Error Class
 */
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

module.exports = NotFoundError;
