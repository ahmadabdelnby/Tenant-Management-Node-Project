const express = require('express');
const router = express.Router();
const tenancyController = require('./tenancy.controller');
const { authenticate } = require('../../middleware');
const { authorize } = require('../../middleware/rbac.middleware');

/**
 * @route   GET /api/my-tenancies
 * @desc    Get current user's tenancies
 * @access  Tenant only
 */
router.get('/', authenticate, authorize('TENANT'), tenancyController.getMyTenancies);

module.exports = router;
