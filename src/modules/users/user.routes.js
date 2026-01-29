const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { createUserSchema, updateUserSchema, updateProfileSchema, userIdParamSchema } = require('./user.validation');
const { authenticate, isAdmin, validate, auditLog } = require('../../middleware');

/**
 * @route   GET /api/users
 * @desc    Get all users (paginated)
 * @access  Admin only
 */
router.get('/', authenticate, isAdmin, userController.getAll);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createUserSchema),
  auditLog('CREATE', 'USER'),
  userController.create
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get(
  '/:id',
  authenticate,
  isAdmin,
  validate(userIdParamSchema, 'params'),
  userController.getById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  auditLog('UPDATE', 'USER'),
  userController.update
);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user
 * @access  Admin only
 */
router.patch(
  '/:id/deactivate',
  authenticate,
  isAdmin,
  validate(userIdParamSchema, 'params'),
  auditLog('DEACTIVATE', 'USER'),
  userController.deactivate
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user
 * @access  Admin only
 */
router.patch(
  '/:id/activate',
  authenticate,
  isAdmin,
  validate(userIdParamSchema, 'params'),
  auditLog('ACTIVATE', 'USER'),
  userController.activate
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(userIdParamSchema, 'params'),
  auditLog('DELETE', 'USER'),
  userController.delete
);

module.exports = router;
