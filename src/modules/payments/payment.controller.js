const paymentService = require('./payment.service');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');

/**
 * Payment Controller
 */
const paymentController = {
  /**
   * Get all payments
   * GET /api/payments
   */
  async getAll(req, res, next) {
    try {
      const { page, limit } = parsePaginationParams(req.query);
      const { tenancyId, buildingId, month, year, status } = req.query;

      const filters = {};
      if (tenancyId) filters.tenancyId = parseInt(tenancyId);
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (month) filters.month = parseInt(month);
      if (year) filters.year = parseInt(year);
      if (status) filters.status = status;

      const result = await paymentService.getAllPayments(page, limit, filters, req.user);

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Payments retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  async getById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(
        parseInt(req.params.id),
        req.user
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(payment, 'Payment retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generate monthly payments for all active tenancies
   * POST /api/payments/generate
   */
  async generateMonthly(req, res, next) {
    try {
      const { month, year } = req.body;
      const result = await paymentService.generateMonthlyPayments(month, year, req.user.id);

      res.status(HTTP_STATUS.CREATED).json(
        createdResponse(result, result.message)
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update payment
   * PUT /api/payments/:id
   */
  async update(req, res, next) {
    try {
      const payment = await paymentService.updatePayment(
        parseInt(req.params.id),
        req.body,
        req.user
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(payment, 'Payment updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create Tahseeel payment link
   * POST /api/payments/:id/create-link
   */
  async createPaymentLink(req, res, next) {
    try {
      const result = await paymentService.createPaymentLink(
        parseInt(req.params.id),
        req.user
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Payment link created successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle Tahseeel callback
   * GET /api/payments/tahseeel/callback
   * (This is called by Tahseeel after payment - redirects user)
   */
  async tahseeelCallback(req, res, next) {
    try {
      const result = await paymentService.handleTahseeelCallback(req.query);

      // Redirect to frontend with result
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const status = result.success ? 'success' : 'failed';
      res.redirect(`${frontendUrl}/payments/result?status=${status}&paymentId=${result.paymentId || ''}`);
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/payments/result?status=error`);
    }
  },

  /**
   * Get building payment summary
   * GET /api/payments/building-summary
   */
  async getBuildingSummary(req, res, next) {
    try {
      const { buildingId, month, year } = req.query;

      if (!buildingId || !month || !year) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'buildingId, month, and year are required',
        });
      }

      const result = await paymentService.getBuildingPaymentSummary(
        parseInt(buildingId),
        parseInt(month),
        parseInt(year),
        req.user
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Building payment summary retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export payments to Excel
   * GET /api/payments/export
   */
  async exportExcel(req, res, next) {
    try {
      const { buildingId, month, year, status } = req.query;

      const filters = {};
      if (buildingId) filters.buildingId = parseInt(buildingId);
      if (month) filters.month = parseInt(month);
      if (year) filters.year = parseInt(year);
      if (status) filters.status = status;

      const workbook = await paymentService.exportToExcel(filters, req.user);

      // Set headers for Excel download
      const filename = `Payment_Report_${month || 'All'}_${year || 'All'}_${Date.now()}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
