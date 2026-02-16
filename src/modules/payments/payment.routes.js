const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { generatePaymentsSchema, updatePaymentSchema, paymentIdParamSchema } = require('./payment.validation');
const { authenticate, isAdmin, isAdminOrOwner, isAuthenticated, validate, auditLog } = require('../../middleware');

/**
 * @route   GET /api/payments/tahseeel/callback
 * @desc    Handle Tahseeel payment callback (no auth - called by Tahseeel)
 * @access  Public
 */
router.get('/tahseeel/callback', paymentController.tahseeelCallback);

/**
 * @route   GET /api/payments/export
 * @desc    Export payments to Excel
 * @access  Admin, Owner
 */
router.get('/export', authenticate, isAdminOrOwner, paymentController.exportExcel);

/**
 * @route   GET /api/payments/building-summary
 * @desc    Get building payment summary for a month
 * @access  Admin, Owner
 */
router.get('/building-summary', authenticate, isAdminOrOwner, paymentController.getBuildingSummary);

/**
 * @route   GET /api/payments
 * @desc    Get all payments (paginated)
 * @access  Admin, Owner (own buildings), Tenant (own payments)
 */
router.get('/', authenticate, isAuthenticated, paymentController.getAll);

/**
 * @route   POST /api/payments/generate
 * @desc    Generate monthly payment records for all active tenancies
 * @access  Admin only
 */
router.post(
  '/generate',
  authenticate,
  isAdmin,
  validate(generatePaymentsSchema),
  auditLog('GENERATE', 'PAYMENT'),
  paymentController.generateMonthly
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Admin, Owner, Tenant (own payment)
 */
router.get(
  '/:id',
  authenticate,
  isAuthenticated,
  validate(paymentIdParamSchema, 'params'),
  paymentController.getById
);

/**
 * @route   PUT /api/payments/:id
 * @desc    Update payment (mark as paid, etc.)
 * @access  Admin, Owner
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrOwner,
  validate(paymentIdParamSchema, 'params'),
  validate(updatePaymentSchema),
  auditLog('UPDATE', 'PAYMENT'),
  paymentController.update
);

/**
 * @route   POST /api/payments/:id/create-link
 * @desc    Create Tahseeel payment link
 * @access  Admin, Owner
 */
router.post(
  '/:id/create-link',
  authenticate,
  isAdminOrOwner,
  validate(paymentIdParamSchema, 'params'),
  auditLog('CREATE_LINK', 'PAYMENT'),
  paymentController.createPaymentLink
);

module.exports = router;
