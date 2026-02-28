const Joi = require('joi');

// Only allow Google Maps embed URLs
const MAP_EMBED_PATTERN = /^https:\/\/(www\.)?google\.com\/maps\/embed/;

/**
 * Create building validation schema
 */
const createBuildingSchema = Joi.object({
  nameEn: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Building name (English) must be at least 2 characters',
      'string.max': 'Building name (English) cannot exceed 100 characters',
      'any.required': 'Building name (English) is required',
    }),
  nameAr: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Building name (Arabic) must be at least 2 characters',
      'string.max': 'Building name (Arabic) cannot exceed 100 characters',
      'any.required': 'Building name (Arabic) is required',
    }),
  address: Joi.string()
    .trim()
    .min(5)
    .max(255)
    .required()
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 255 characters',
      'any.required': 'Address is required',
    }),
  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 100 characters',
      'any.required': 'City is required',
    }),
  postalCode: Joi.string()
    .trim()
    .max(20)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Postal code cannot exceed 20 characters',
    }),
  country: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 100 characters',
      'any.required': 'Country is required',
    }),
  mapEmbed: Joi.string()
    .trim()
    .max(2000)
    .pattern(MAP_EMBED_PATTERN)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Map embed code cannot exceed 2000 characters',
      'string.pattern.base': 'Map embed must be a valid Google Maps embed URL (https://www.google.com/maps/embed...)',
    }),
  descriptionEn: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description (English) cannot exceed 2000 characters',
    }),
  descriptionAr: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description (Arabic) cannot exceed 2000 characters',
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .allow(null)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .allow(null)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
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
  nameEn: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Building name (English) must be at least 2 characters',
      'string.max': 'Building name (English) cannot exceed 100 characters',
    }),
  nameAr: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Building name (Arabic) must be at least 2 characters',
      'string.max': 'Building name (Arabic) cannot exceed 100 characters',
    }),
  address: Joi.string()
    .trim()
    .min(5)
    .max(255)
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 255 characters',
    }),
  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 100 characters',
    }),
  postalCode: Joi.string()
    .trim()
    .max(20)
    .allow('')
    .messages({
      'string.max': 'Postal code cannot exceed 20 characters',
    }),
  country: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 100 characters',
    }),
  mapEmbed: Joi.string()
    .trim()
    .max(2000)
    .pattern(MAP_EMBED_PATTERN)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Map embed code cannot exceed 2000 characters',
      'string.pattern.base': 'Map embed must be a valid Google Maps embed URL (https://www.google.com/maps/embed...)',
    }),
  descriptionEn: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description (English) cannot exceed 2000 characters',
    }),
  descriptionAr: Joi.string()
    .trim()
    .max(2000)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Description (Arabic) cannot exceed 2000 characters',
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .allow(null)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .allow(null)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
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
