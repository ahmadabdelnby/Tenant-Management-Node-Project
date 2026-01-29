const tenancyService = require('./tenancy.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');

/**
 * Tenancy Controller
 */
const tenancyController = {
  /**
   * Get all tenancies
   * GET /api/tenancies
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { unitId, buildingId, isActive } = req.query;
      
      const filters = {};
      if (unitId) filters.unitId = parseInt(unitId);
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const result = await tenancyService.getAllTenancies(page, limit, filters, req.user);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Tenancies retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get tenancy by ID
   * GET /api/tenancies/:id
   */
  async getById(req, res, next) {
    try {
      const tenancy = await tenancyService.getTenancyById(
        parseInt(req.params.id),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancy, 'Tenancy retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create tenancy
   * POST /api/tenancies
   */
  async create(req, res, next) {
    try {
      const tenancy = await tenancyService.createTenancy(req.body);
      
      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(tenancy, 'Tenancy created successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Update tenancy
   * PUT /api/tenancies/:id
   */
  async update(req, res, next) {
    try {
      const tenancy = await tenancyService.updateTenancy(
        parseInt(req.params.id),
        req.body
      );
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancy, 'Tenancy updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * End tenancy
   * PATCH /api/tenancies/:id/end
   */
  async end(req, res, next) {
    try {
      const result = await tenancyService.endTenancy(parseInt(req.params.id));
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Tenancy ended successfully')
      );
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get my tenancies (for Tenant role)
   * GET /api/my-tenancies
   */
  async getMyTenancies(req, res, next) {
    try {
      const tenancies = await tenancyService.getMyTenancies(req.user.id);
      
      res.status(HTTP_STATUS.OK).json(
        successResponse(tenancies, 'Tenancies retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = tenancyController;
