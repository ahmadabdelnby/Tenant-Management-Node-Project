const Joi = require('joi');
const { ROLES_ARRAY } = require('../../shared/constants');

/**
 * Create user validation schema
 */
const createUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  role: Joi.string()
    .valid(...ROLES_ARRAY)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
      'any.required': 'Role is required',
    }),
});

/**
 * Update user validation schema (Admin updating any user)
 */
const updateUserSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  role: Joi.string()
    .valid(...ROLES_ARRAY)
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
    }),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Update profile validation schema (User updating their own profile)
 */
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * User ID param validation
 */
const userIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.integer': 'User ID must be an integer',
      'number.positive': 'User ID must be a positive number',
      'any.required': 'User ID is required',
    }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  userIdParamSchema,
};
