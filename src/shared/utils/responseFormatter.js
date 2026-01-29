const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Format success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
const successResponse = (data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Validation errors or additional info
 * @returns {Object} - Formatted response
 */
const errorResponse = (message = 'Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return response;
};

/**
 * Format created response
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 * @returns {Object} - Formatted response
 */
const createdResponse = (data, message = 'Resource created successfully') => {
  return successResponse(data, message, HTTP_STATUS.CREATED);
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
};
