const express = require('express');
const router = express.Router();
const tenancyController = require('./tenancy.controller');
const { createTenancySchema, updateTenancySchema, tenancyIdParamSchema } = require('./tenancy.validation');
const { authenticate, isAdmin, isAuthenticated, validate, auditLog } = require('../../middleware');

/**
 * @route   GET /api/tenancies
 * @desc    Get all tenancies (paginated)
 * @access  Admin, Owner (own buildings), Tenant (own tenancies)
 */
router.get('/', authenticate, isAuthenticated, tenancyController.getAll);

/**
 * @route   GET /api/tenancies/my-tenancies
 * @desc    Get current tenant's tenancies
 * @access  Tenant only
 */
router.get('/my-tenancies', authenticate, isAuthenticated, tenancyController.getMyTenancies);

/**
 * @route   POST /api/tenancies
 * @desc    Create new tenancy
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createTenancySchema),
  auditLog('CREATE', 'TENANCY'),
  tenancyController.create
);

/**
 * @route   GET /api/tenancies/:id
 * @desc    Get tenancy by ID
 * @access  Admin, Owner (own buildings), Tenant (own tenancy)
 */
router.get(
  '/:id',
  authenticate,
  isAuthenticated,
  validate(tenancyIdParamSchema, 'params'),
  tenancyController.getById
);

/**
 * @route   PUT /api/tenancies/:id
 * @desc    Update tenancy
 * @access  Admin only
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validate(tenancyIdParamSchema, 'params'),
  validate(updateTenancySchema),
  auditLog('UPDATE', 'TENANCY'),
  tenancyController.update
);

/**
 * @route   PATCH /api/tenancies/:id/end
 * @desc    End tenancy
 * @access  Admin only
 */
router.patch(
  '/:id/end',
  authenticate,
  isAdmin,
  validate(tenancyIdParamSchema, 'params'),
  auditLog('END', 'TENANCY'),
  tenancyController.end
);

module.exports = router;
