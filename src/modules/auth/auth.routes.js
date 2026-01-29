const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { loginSchema } = require('./auth.validation');
const { authenticate, validate, loginLimiter } = require('../../middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (blacklist token)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
