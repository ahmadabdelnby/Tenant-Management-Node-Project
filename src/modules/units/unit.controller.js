const unitService = require('./unit.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');

/**
 * Unit Controller
 */
const unitController = {
  /**
   * Get all units
   * GET /api/units
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { buildingId, status, minBedrooms, maxRent } = req.query;
      
      const filters = {};
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (status) filters.status = status;
      if (minBedrooms) filters.minBedrooms = parseInt(minBedrooms);
      if (maxRent) filters.maxRent = parseFloat(maxRent);
      
      const result = await unitService.getAllUnits(page, limit, filters, req.user);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Units retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get unit by ID
   * GET /api/units/:id
   */
  async getById(req, res, next) {
    try {
      const unit = await unitService.getUnitById(
        parseInt(req.params.id),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(unit, 'Unit retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create unit
   * POST /api/units
   */
  async create(req, res, next) {
    try {
      const unit = await unitService.createUnit(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(unit, 'Unit created successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update unit
   * PUT /api/units/:id
   */
  async update(req, res, next) {
    try {
      const unit = await unitService.updateUnit(
        parseInt(req.params.id),
        req.body,
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(unit, 'Unit updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete unit (soft delete)
   * DELETE /api/units/:id
   */
  async delete(req, res, next) {
    try {
      const result = await unitService.deleteUnit(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Unit deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get units by building ID
   * GET /api/buildings/:buildingId/units
   */
  async getByBuildingId(req, res, next) {
    try {
      const units = await unitService.getUnitsByBuildingId(
        parseInt(req.params.buildingId),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(units, 'Units retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = unitController;
