const Joi = require('joi');
const { UNIT_STATUS_ARRAY, UNIT_TYPE_ARRAY } = require('../../shared/constants');

/**
 * Create unit validation schema
 */
const createUnitSchema = Joi.object({
  buildingId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Building ID must be a number',
      'number.integer': 'Building ID must be an integer',
      'number.positive': 'Building ID must be a positive number',
      'any.required': 'Building ID is required',
    }),
  unitNumber: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .required()
    .messages({
      'string.min': 'Unit number is required',
      'string.max': 'Unit number cannot exceed 20 characters',
      'any.required': 'Unit number is required',
    }),
  floor: Joi.number()
    .integer()
    .min(0)
    .max(200)
    .optional()
    .messages({
      'number.base': 'Floor must be a number',
      'number.integer': 'Floor must be an integer',
      'number.min': 'Floor cannot be negative',
      'number.max': 'Floor cannot exceed 200',
    }),
  bedrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .required()
    .messages({
      'number.base': 'Bedrooms must be a number',
      'number.integer': 'Bedrooms must be an integer',
      'number.min': 'Bedrooms cannot be negative',
      'number.max': 'Bedrooms cannot exceed 20',
      'any.required': 'Number of bedrooms is required',
    }),
  bathrooms: Joi.number()
    .min(0)
    .max(20)
    .required()
    .messages({
      'number.base': 'Bathrooms must be a number',
      'number.min': 'Bathrooms cannot be negative',
      'number.max': 'Bathrooms cannot exceed 20',
      'any.required': 'Number of bathrooms is required',
    }),
  area: Joi.number()
    .positive()
    .max(100000)
    .optional()
    .messages({
      'number.base': 'Area must be a number',
      'number.positive': 'Area must be a positive number',
      'number.max': 'Area cannot exceed 100,000 sqft',
    }),
  rentAmount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Rent amount must be a number',
      'number.positive': 'Rent amount must be a positive number',
      'any.required': 'Rent amount is required',
    }),
  type: Joi.string()
    .valid(...UNIT_TYPE_ARRAY)
    .required()
    .messages({
      'any.only': `Type must be one of: ${UNIT_TYPE_ARRAY.join(', ')}`,
      'any.required': 'Unit type is required',
    }),
});

/**
 * Update unit validation schema
 */
const updateUnitSchema = Joi.object({
  buildingId: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'Building ID must be a number',
      'number.integer': 'Building ID must be an integer',
      'number.positive': 'Building ID must be a positive number',
    }),
  unitNumber: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .messages({
      'string.min': 'Unit number is required',
      'string.max': 'Unit number cannot exceed 20 characters',
    }),
  floor: Joi.number()
    .integer()
    .min(0)
    .max(200)
    .messages({
      'number.base': 'Floor must be a number',
      'number.integer': 'Floor must be an integer',
      'number.min': 'Floor cannot be negative',
      'number.max': 'Floor cannot exceed 200',
    }),
  bedrooms: Joi.number()
    .integer()
    .min(0)
    .max(20)
    .messages({
      'number.base': 'Bedrooms must be a number',
      'number.integer': 'Bedrooms must be an integer',
      'number.min': 'Bedrooms cannot be negative',
      'number.max': 'Bedrooms cannot exceed 20',
    }),
  bathrooms: Joi.number()
    .min(0)
    .max(20)
    .messages({
      'number.base': 'Bathrooms must be a number',
      'number.min': 'Bathrooms cannot be negative',
      'number.max': 'Bathrooms cannot exceed 20',
    }),
  area: Joi.number()
    .positive()
    .max(100000)
    .messages({
      'number.base': 'Area must be a number',
      'number.positive': 'Area must be a positive number',
      'number.max': 'Area cannot exceed 100,000 sqft',
    }),
  rentAmount: Joi.number()
    .positive()
    .messages({
      'number.base': 'Rent amount must be a number',
      'number.positive': 'Rent amount must be a positive number',
    }),
  status: Joi.string()
    .valid(...UNIT_STATUS_ARRAY)
    .messages({
      'any.only': `Status must be one of: ${UNIT_STATUS_ARRAY.join(', ')}`,
    }),
  type: Joi.string()
    .valid(...UNIT_TYPE_ARRAY)
    .messages({
      'any.only': `Type must be one of: ${UNIT_TYPE_ARRAY.join(', ')}`,
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Unit ID param validation
 */
const unitIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Unit ID must be a number',
      'number.integer': 'Unit ID must be an integer',
      'number.positive': 'Unit ID must be a positive number',
      'any.required': 'Unit ID is required',
    }),
});

module.exports = {
  createUnitSchema,
  updateUnitSchema,
  unitIdParamSchema,
};
