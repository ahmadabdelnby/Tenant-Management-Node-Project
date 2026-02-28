const Joi = require('joi');

const PAYMENT_STATUS = ['PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID'];
const PAYMENT_METHODS = ['CASH', 'BANK_TRANSFER', 'TAHSEEEL', 'OTHER'];

/**
 * Create/Generate payments for a month
 */
const generatePaymentsSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required()
    .messages({ 'any.required': 'Month is required', 'number.min': 'Month must be between 1 and 12' }),
  year: Joi.number().integer().min(2020).max(2100).required()
    .messages({ 'any.required': 'Year is required' }),
});

/**
 * Update payment status (mark as paid, etc.)
 */
const updatePaymentSchema = Joi.object({
  status: Joi.string().valid(...PAYMENT_STATUS)
    .messages({ 'any.only': `Status must be one of: ${PAYMENT_STATUS.join(', ')}` }),
  paymentMethod: Joi.string().valid(...PAYMENT_METHODS)
    .messages({ 'any.only': `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` }),
  amount: Joi.number().positive()
    .messages({ 'number.positive': 'Amount must be positive' }),
  notes: Joi.string().trim().max(1000).allow('', null),
  paidAt: Joi.date().iso().allow(null),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Payment ID param validation
 */
const paymentIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Payment ID is required' }),
});

/**
 * Send payment link validation
 */
const sendPaymentLinkSchema = Joi.object({
  paymentId: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Payment ID is required' }),
});

/**
 * Building payment summary query
 */
const buildingPaymentQuerySchema = Joi.object({
  buildingId: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Building ID is required' }),
  month: Joi.number().integer().min(1).max(12).required()
    .messages({ 'any.required': 'Month is required' }),
  year: Joi.number().integer().min(2020).max(2100).required()
    .messages({ 'any.required': 'Year is required' }),
});

module.exports = {
  generatePaymentsSchema,
  updatePaymentSchema,
  paymentIdParamSchema,
  sendPaymentLinkSchema,
  buildingPaymentQuerySchema,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
};
