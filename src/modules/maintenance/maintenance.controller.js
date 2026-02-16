const maintenanceService = require('./maintenance.service');
const maintenanceRepository = require('./maintenance.repository');
const { HTTP_STATUS } = require('../../shared/constants');
const { successResponse } = require('../../shared/utils/responseFormatter');
const logger = require('../../shared/utils/logger');

/**
 * Maintenance Controller - HTTP request handling
 */
const maintenanceController = {
  /**
   * @swagger
   * /maintenance/my-units:
   *   get:
   *     summary: Get tenant's rented units
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async getMyUnits(req, res, next) {
    try {
      logger.info(`getMyUnits called for user: ${req.user.id}`);
      const units = await maintenanceRepository.getTenantUnits(req.user.id);
      logger.info(`Found ${units.length} units for tenant ${req.user.id}`);
      
      const formattedUnits = units.map(u => ({
        unitId: u.unit_id,
        unitNumber: u.unit_number,
        floor: u.floor,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        buildingId: u.building_id,
        buildingName: u.building_name,
        buildingAddress: u.building_address,
      }));
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: formattedUnits,
      });
    } catch (error) {
      logger.error(`getMyUnits error: ${error.message}`);
      next(error);
    }
  },
  
  /**
   * @swagger
   * /maintenance:
   *   get:
   *     summary: Get all maintenance requests
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        category: req.query.category,
        buildingId: req.query.buildingId,
      };
      
      const result = await maintenanceService.getAllRequests(page, limit, filters, req.user);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @swagger
   * /maintenance/{id}:
   *   get:
   *     summary: Get maintenance request by ID
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async getById(req, res, next) {
    try {
      const request = await maintenanceService.getRequestById(
        parseInt(req.params.id, 10),
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @swagger
   * /maintenance:
   *   post:
   *     summary: Create new maintenance request (Tenant)
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async create(req, res, next) {
    try {
      const request = await maintenanceService.createRequest(req.body, req.user);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Maintenance request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @swagger
   * /maintenance/{id}:
   *   put:
   *     summary: Update maintenance request
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async update(req, res, next) {
    try {
      const request = await maintenanceService.updateRequest(
        parseInt(req.params.id, 10),
        req.body,
        req.user
      );
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Maintenance request updated successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * @swagger
   * /maintenance/{id}:
   *   delete:
   *     summary: Delete maintenance request (Admin only)
   *     tags: [Maintenance]
   *     security:
   *       - bearerAuth: []
   */
  async delete(req, res, next) {
    try {
      await maintenanceService.deleteRequest(parseInt(req.params.id, 10));
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Maintenance request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export maintenance requests to Excel
   * GET /api/maintenance/export
   */
  async exportExcel(req, res, next) {
    try {
      const { buildingId, status, priority, category, dateFrom, dateTo } = req.query;

      const filters = {};
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const workbook = await maintenanceService.exportToExcel(filters, req.user);

      const filename = `Maintenance_Report_${Date.now()}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = maintenanceController;
