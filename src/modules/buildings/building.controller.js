const buildingService = require('./building.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');

/**
 * Building Controller
 */
const buildingController = {
  /**
   * Get all buildings
   * GET /api/buildings
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { city, search } = req.query;
      
      const filters = {};
      if (city) filters.city = city;
      if (search) filters.search = search;
      
      const result = await buildingService.getAllBuildings(page, limit, filters, req.user);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Buildings retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get building by ID
   * GET /api/buildings/:id
   */
  async getById(req, res, next) {
    try {
      const building = await buildingService.getBuildingById(
        parseInt(req.params.id),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(building, 'Building retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create building
   * POST /api/buildings
   */
  async create(req, res, next) {
    try {
      const building = await buildingService.createBuilding(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(building, 'Building created successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update building
   * PUT /api/buildings/:id
   */
  async update(req, res, next) {
    try {
      const building = await buildingService.updateBuilding(
        parseInt(req.params.id),
        req.body,
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(building, 'Building updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete building (soft delete)
   * DELETE /api/buildings/:id
   */
  async delete(req, res, next) {
    try {
      const result = await buildingService.deleteBuilding(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Building deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = buildingController;
