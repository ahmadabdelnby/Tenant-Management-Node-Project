const express = require('express');
const router = express.Router();
const cityController = require('./city.controller');
const { authenticate, isAuthenticated } = require('../../middleware');

/**
 * @route   GET /api/cities
 * @desc    Get all cities
 * @access  Authenticated users
 */
router.get('/', authenticate, isAuthenticated, cityController.getAll);

module.exports = router;
