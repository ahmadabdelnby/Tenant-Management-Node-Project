const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { updateProfileSchema, changePasswordSchema } = require('./user.validation');
const { authenticate, validate, auditLog } = require('../../middleware');

/**
 * @route   PUT /api/profile
 * @desc    Update own profile
 * @access  Authenticated users
 */
router.put(
  '/',
  authenticate,
  validate(updateProfileSchema),
  auditLog('UPDATE_PROFILE', 'USER'),
  userController.updateProfile
);

/**
 * @route   PUT /api/profile/change-password
 * @desc    Change own password
 * @access  Authenticated users
 */
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  auditLog('CHANGE_PASSWORD', 'USER'),
  userController.changePassword
);

module.exports = router;
