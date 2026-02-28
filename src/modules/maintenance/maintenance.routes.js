const express = require('express');
const maintenanceController = require('./maintenance.controller');
const { authenticate, isAdmin, isAdminOrOwner, validate } = require('../../middleware');
const {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceIdParamSchema,
} = require('./maintenance.validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/maintenance/my-units
 * @desc    Get tenant's rented units for maintenance request
 * @access  Tenant
 */
router.get('/my-units', maintenanceController.getMyUnits);

/**
 * @route   GET /api/maintenance/export
 * @desc    Export maintenance requests to Excel
 * @access  Admin, Owner
 */
router.get('/export', isAdminOrOwner, maintenanceController.exportExcel);

/**
 * @route   GET /api/maintenance
 * @desc    Get all maintenance requests (filtered by role)
 * @access  All authenticated users
 */
router.get('/', maintenanceController.getAll);

/**
 * @route   GET /api/maintenance/:id
 * @desc    Get maintenance request by ID
 * @access  All authenticated users (filtered by role)
 */
router.get('/:id', validate(maintenanceIdParamSchema, 'params'), maintenanceController.getById);

/**
 * @route   POST /api/maintenance
 * @desc    Create new maintenance request
 * @access  Tenant only
 */
router.post('/', validate(createMaintenanceSchema), maintenanceController.create);

/**
 * @route   PUT /api/maintenance/:id
 * @desc    Update maintenance request
 * @access  Admin/Owner (full update), Tenant (cancel only)
 */
router.put('/:id', validate(maintenanceIdParamSchema, 'params'), validate(updateMaintenanceSchema), maintenanceController.update);

/**
 * @route   DELETE /api/maintenance/:id
 * @desc    Delete maintenance request
 * @access  Admin only
 */
router.delete('/:id', validate(maintenanceIdParamSchema, 'params'), isAdmin, maintenanceController.delete);

module.exports = router;
