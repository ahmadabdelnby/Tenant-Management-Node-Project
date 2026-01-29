const express = require('express');
const router = express.Router();
const unitController = require('./unit.controller');
const { createUnitSchema, updateUnitSchema, unitIdParamSchema } = require('./unit.validation');
const { authenticate, isAdmin, isAdminOrOwner, validate, auditLog } = require('../../middleware');

/**
 * @route   GET /api/units
 * @desc    Get all units (paginated)
 * @access  Admin, Owner
 */
router.get('/', authenticate, isAdminOrOwner, unitController.getAll);

/**
 * @route   POST /api/units
 * @desc    Create new unit
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate(createUnitSchema),
  auditLog('CREATE', 'UNIT'),
  unitController.create
);

/**
 * @route   GET /api/units/:id
 * @desc    Get unit by ID
 * @access  Admin, Owner (own buildings only)
 */
router.get(
  '/:id',
  authenticate,
  isAdminOrOwner,
  validate(unitIdParamSchema, 'params'),
  unitController.getById
);

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit
 * @access  Admin, Owner (own buildings only)
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrOwner,
  validate(unitIdParamSchema, 'params'),
  validate(updateUnitSchema),
  auditLog('UPDATE', 'UNIT'),
  unitController.update
);

/**
 * @route   DELETE /api/units/:id
 * @desc    Soft delete unit
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(unitIdParamSchema, 'params'),
  auditLog('DELETE', 'UNIT'),
  unitController.delete
);

module.exports = router;
