const { ValidationError } = require('../shared/errors');
const { ERROR_MESSAGES } = require('../shared/constants');

/**
 * Validation Middleware Factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate (body, query, params)
 * @returns {Function} - Middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      
      return next(new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR, errors));
    }
    
    // Replace with validated and sanitized values
    req[property] = value;
    next();
  };
};

module.exports = validate;
