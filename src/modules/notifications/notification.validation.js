const Joi = require('joi');

/**
 * Notification ID param validation
 */
const notificationIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Notification ID must be a number',
      'number.integer': 'Notification ID must be an integer',
      'number.positive': 'Notification ID must be a positive number',
      'any.required': 'Notification ID is required',
    }),
});

/**
 * Get notifications query validation
 */
const getNotificationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  isRead: Joi.boolean(),
});

module.exports = {
  notificationIdParamSchema,
  getNotificationsQuerySchema,
};
