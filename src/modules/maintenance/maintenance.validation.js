// ============================================
// Maintenance Request Validation Schemas
// ============================================

const Joi = require('joi');

const MAINTENANCE_CATEGORIES = ['PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL', 'OTHER'];
const MAINTENANCE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const MAINTENANCE_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

/**
 * Create maintenance request validation schema (Tenant)
 */
const createMaintenanceSchema = Joi.object({
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
  title: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
    }),
  description: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required',
    }),
  category: Joi.string()
    .valid(...MAINTENANCE_CATEGORIES)
    .required()
    .messages({
      'any.only': `Category must be one of: ${MAINTENANCE_CATEGORIES.join(', ')}`,
      'any.required': 'Category is required',
    }),
  priority: Joi.string()
    .valid(...MAINTENANCE_PRIORITIES)
    .required()
    .messages({
      'any.only': `Priority must be one of: ${MAINTENANCE_PRIORITIES.join(', ')}`,
      'any.required': 'Priority is required',
    }),
});

/**
 * Update maintenance request validation schema (Admin/Owner)
 */
const updateMaintenanceSchema = Joi.object({
  status: Joi.string()
    .valid(...MAINTENANCE_STATUSES)
    .messages({
      'any.only': `Status must be one of: ${MAINTENANCE_STATUSES.join(', ')}`,
    }),
  priority: Joi.string()
    .valid(...MAINTENANCE_PRIORITIES)
    .messages({
      'any.only': `Priority must be one of: ${MAINTENANCE_PRIORITIES.join(', ')}`,
    }),
  resolutionNotes: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .messages({
      'string.max': 'Resolution notes cannot exceed 2000 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Maintenance ID param validation
 */
const maintenanceIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Maintenance request ID must be a number',
      'number.integer': 'Maintenance request ID must be an integer',
      'number.positive': 'Maintenance request ID must be a positive number',
      'any.required': 'Maintenance request ID is required',
    }),
});

module.exports = {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceIdParamSchema,
};
