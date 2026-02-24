const express = require('express');
const router = express.Router();
const buildingController = require('./building.controller');
const { createBuildingSchema, updateBuildingSchema, buildingIdParamSchema } = require('./building.validation');
const { authenticate, isAdmin, isAdminOrOwner, isAuthenticated, validate, auditLog } = require('../../middleware');

/**
 * @route   GET /api/buildings
 * @desc    Get all buildings (paginated)
 * @access  Admin, Owner
 */
router.get('/', authenticate, isAdminOrOwner, buildingController.getAll);

/**
 * @route   POST /api/buildings
 * @desc    Create new building
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createBuildingSchema),
  auditLog('CREATE', 'BUILDING'),
  buildingController.create
);

/**
 * @route   GET /api/buildings/:id
 * @desc    Get building by ID
 * @access  Admin, Owner (own buildings only), Tenant (own tenancy building)
 */
router.get(
  '/:id',
  authenticate,
  isAuthenticated,
  validate(buildingIdParamSchema, 'params'),
  buildingController.getById
);

/**
 * @route   PUT /api/buildings/:id
 * @desc    Update building
 * @access  Admin, Owner (own buildings only)
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrOwner,
  validate(buildingIdParamSchema, 'params'),
  validate(updateBuildingSchema),
  auditLog('UPDATE', 'BUILDING'),
  buildingController.update
);

/**
 * @route   DELETE /api/buildings/:id
 * @desc    Soft delete building
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(buildingIdParamSchema, 'params'),
  auditLog('DELETE', 'BUILDING'),
  buildingController.delete
);

module.exports = router;
