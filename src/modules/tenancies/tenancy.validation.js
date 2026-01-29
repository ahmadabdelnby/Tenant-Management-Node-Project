const Joi = require('joi');

/**
 * Create tenancy validation schema
 */
const createTenancySchema = Joi.object({
  unitId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Unit ID must be a number',
      'number.integer': 'Unit ID must be an integer',
      'number.positive': 'Unit ID must be a positive number',
      'any.required': 'Unit ID is required',
    }),
  tenantId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenant ID must be a number',
      'number.integer': 'Tenant ID must be an integer',
      'number.positive': 'Tenant ID must be a positive number',
      'any.required': 'Tenant ID is required',
    }),
  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Start date is required',
    }),
  endDate: Joi.date()
    .iso()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
  monthlyRent: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Monthly rent must be a number',
      'number.positive': 'Monthly rent must be a positive number',
      'any.required': 'Monthly rent is required',
    }),
  depositAmount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Deposit amount must be a number',
      'number.min': 'Deposit amount cannot be negative',
      'any.required': 'Deposit amount is required',
    }),
});

/**
 * Update tenancy validation schema
 */
const updateTenancySchema = Joi.object({
  endDate: Joi.date()
    .iso()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
    }),
  monthlyRent: Joi.number()
    .positive()
    .messages({
      'number.base': 'Monthly rent must be a number',
      'number.positive': 'Monthly rent must be a positive number',
    }),
  depositAmount: Joi.number()
    .min(0)
    .messages({
      'number.base': 'Deposit amount must be a number',
      'number.min': 'Deposit amount cannot be negative',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Tenancy ID param validation
 */
const tenancyIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Tenancy ID must be a number',
      'number.integer': 'Tenancy ID must be an integer',
      'number.positive': 'Tenancy ID must be a positive number',
      'any.required': 'Tenancy ID is required',
    }),
});

module.exports = {
  createTenancySchema,
  updateTenancySchema,
  tenancyIdParamSchema,
};
