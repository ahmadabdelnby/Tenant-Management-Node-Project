const Joi = require('joi');

/**
 * Create building validation schema
 */
const createBuildingSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Building name must be at least 2 characters',
      'string.max': 'Building name cannot exceed 100 characters',
      'any.required': 'Building name is required',
    }),
  address: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 255 characters',
      'any.required': 'Address is required',
    }),
  city: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 100 characters',
      'any.required': 'City is required',
    }),
  postalCode: Joi.string()
    .max(20)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Postal code cannot exceed 20 characters',
    }),
  country: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 100 characters',
      'any.required': 'Country is required',
    }),
  ownerId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Owner ID must be a number',
      'number.integer': 'Owner ID must be an integer',
      'number.positive': 'Owner ID must be a positive number',
      'any.required': 'Owner ID is required',
    }),
});

/**
 * Update building validation schema
 */
const updateBuildingSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Building name must be at least 2 characters',
      'string.max': 'Building name cannot exceed 100 characters',
    }),
  address: Joi.string()
    .min(5)
    .max(255)
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 255 characters',
    }),
  city: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 100 characters',
    }),
  postalCode: Joi.string()
    .max(20)
    .allow('')
    .messages({
      'string.max': 'Postal code cannot exceed 20 characters',
    }),
  country: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 100 characters',
    }),
  ownerId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'Owner ID must be a number',
      'number.integer': 'Owner ID must be an integer',
      'number.positive': 'Owner ID must be a positive number',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Building ID param validation
 */
const buildingIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Building ID must be a number',
      'number.integer': 'Building ID must be an integer',
      'number.positive': 'Building ID must be a positive number',
      'any.required': 'Building ID is required',
    }),
});

module.exports = {
  createBuildingSchema,
  updateBuildingSchema,
  buildingIdParamSchema,
};
