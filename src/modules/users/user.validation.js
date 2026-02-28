const Joi = require('joi');
const { ROLES_ARRAY } = require('../../shared/constants');

// Password pattern: at least one uppercase, one lowercase, one digit
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PASSWORD_MESSAGE = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';

/**
 * Create user validation schema
 */
const createUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(PASSWORD_PATTERN)
    .optional()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password cannot exceed 100 characters',
      'string.pattern.base': PASSWORD_MESSAGE,
    }),
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  role: Joi.string()
    .trim()
    .valid(...ROLES_ARRAY)
    .required()
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
      'any.required': 'Role is required',
    }),
  phone: Joi.string()
    .trim()
    .max(20)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
    }),
});

/**
 * Update user validation schema (Admin updating any user)
 */
const updateUserSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  role: Joi.string()
    .trim()
    .valid(...ROLES_ARRAY)
    .messages({
      'any.only': `Role must be one of: ${ROLES_ARRAY.join(', ')}`,
    }),
  phone: Joi.string()
    .trim()
    .max(20)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
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
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
    }),
  phone: Joi.string()
    .trim()
    .max(20)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
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

/**
 * Change password validation schema
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string()
    .min(8)
    .max(100)
    .pattern(PASSWORD_PATTERN)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.max': 'New password cannot exceed 100 characters',
      'string.pattern.base': PASSWORD_MESSAGE,
      'any.required': 'New password is required',
    }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  userIdParamSchema,
};
