const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { updateProfileSchema } = require('./user.validation');
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

module.exports = router;
