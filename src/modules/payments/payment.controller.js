const paymentService = require('./payment.service');
const tahseeelService = require('./tahseeel.service');
const { PaymentLink } = require('../../models');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

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

  /**
   * Generate a standalone Tahseeel payment link
   * POST /api/payments/generate-link
   */
  async generateLink(req, res, next) {
    try {
      const { name, amount } = req.body;

      if (!name || !amount) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'name and amount are required',
        });
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'amount must be a positive number',
        });
      }

      // Generate unique order number
      const orderNo = `PL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Call Tahseeel API
      const result = await tahseeelService.createOrder({
        orderNo,
        amount: parsedAmount,
        customerName: name,
        customerEmail: '',
        customerMobile: '',
      });

      if (!result.success) {
        logger.error('Generate link Tahseeel error:', result.error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.error || 'Failed to generate payment link',
        });
      }

      // Save to PaymentLink table
      await PaymentLink.create({
        order_no: orderNo,
        cust_name: name,
        amount: parsedAmount,
        payment_url: result.link,
        status: 'Pending',
        created_by: req.user.id,
      });

      logger.info(`Payment link generated: ${orderNo} for ${name}, amount: ${parsedAmount}`);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: {
          orderNo,
          link: result.link,
          name,
          amount: parsedAmount,
        },
        message: 'Payment link generated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all generated payment links (history)
   * GET /api/payments/payment-links
   */
  async getPaymentLinks(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (status) {
        where.status = status;
      }

      const { count, rows } = await PaymentLink.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset,
      });

      res.status(HTTP_STATUS.OK).json(
        successResponse(
          {
            data: rows,
            pagination: {
              total: count,
              page: parseInt(page),
              limit: parseInt(limit),
              totalPages: Math.ceil(count / parseInt(limit)),
            },
          },
          'Payment links retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = paymentController;
