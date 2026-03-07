const paymentService = require('./payment.service');
const tahseeelService = require('./tahseeel.service');
const { PaymentLink, User, Unit, Building } = require('../../models');
const { successResponse, createdResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');
const { parsePaginationParams } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');
const PDFDocument = require('pdfkit');

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
      const { name, amount, tenantId, unitId, buildingId } = req.body;

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
        tenant_id: tenantId || null,
        unit_id: unitId || null,
        building_id: buildingId || null,
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
        include: [
          { model: User, as: 'tenant', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: Unit, as: 'unit', attributes: ['id', 'unit_number'] },
          { model: Building, as: 'building', attributes: ['id', 'name_en', 'name_ar'] },
          { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] },
        ],
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

  /**
   * Update payment link status
   * PUT /api/payments/payment-links/:id
   */
  async updatePaymentLink(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const link = await PaymentLink.findByPk(id);
      if (!link) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Payment link not found' });
      }

      await link.update({ status });
      logger.info(`Payment link ${id} status updated to ${status} by user ${req.user.id}`);

      res.status(HTTP_STATUS.OK).json(
        successResponse(link, 'Payment link status updated successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Download invoice PDF for a payment link
   * GET /api/payments/payment-links/:id/invoice
   */
  async downloadPaymentLinkInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const link = await PaymentLink.findByPk(id, {
        include: [
          { model: User, as: 'tenant', attributes: ['first_name', 'last_name', 'email', 'phone'] },
          { model: Unit, as: 'unit', attributes: ['unit_number', 'rent_amount'] },
          { model: Building, as: 'building', attributes: ['name_en', 'name_ar'] },
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
        ],
      });
      if (!link) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Payment link not found' });
      }

      const creatorName = link.creator ? `${link.creator.first_name} ${link.creator.last_name}` : '-';
      const tenantName = link.tenant ? `${link.tenant.first_name} ${link.tenant.last_name}` : link.cust_name;
      const tenantEmail = link.tenant?.email || '-';
      const tenantPhone = link.tenant?.phone || '-';
      const unitNumber = link.unit?.unit_number || '-';
      const buildingName = link.building ? (link.building.name_en || link.building.name_ar) : '-';
      const rentAmount = link.unit ? parseFloat(link.unit.rent_amount).toFixed(3) : null;

      const amount = parseFloat(link.amount).toFixed(3);
      const createdAt = new Date(link.created_at).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const updatedAt = new Date(link.updated_at).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      // Build PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${link.order_no}.pdf`);
      doc.pipe(res);

      // Header bar
      doc.rect(0, 0, doc.page.width, 100).fill('#1a2744');
      doc.fontSize(26).fillColor('#ffffff').text('PAYMENT INVOICE', 50, 30, { align: 'center' });
      doc.fontSize(10).fillColor('#cccccc').text(`Invoice #${link.order_no}`, 50, 65, { align: 'center' });

      // Reset color
      doc.fillColor('#333333');
      let y = 130;

      // Invoice info box
      doc.roundedRect(50, y, doc.page.width - 100, 60, 5).fill('#f5f5f5');
      doc.fillColor('#666666').fontSize(9);
      doc.text('Date Issued:', 70, y + 15);
      doc.text('Status:', 70, y + 35);
      doc.fillColor('#333333').fontSize(10);
      doc.text(createdAt, 160, y + 14);

      const statusColor = link.status === 'Fulfilled' ? '#28a745' : link.status === 'Expired' ? '#dc3545' : '#ffc107';
      doc.roundedRect(160, y + 33, 80, 18, 3).fill(statusColor);
      doc.fillColor('#ffffff').fontSize(9).text(link.status.toUpperCase(), 165, y + 37, { width: 70, align: 'center' });

      doc.fillColor('#666666').fontSize(9);
      doc.text('Last Updated:', 320, y + 15);
      doc.text('Issued By:', 320, y + 35);
      doc.fillColor('#333333').fontSize(10);
      doc.text(updatedAt, 410, y + 14);
      doc.text(creatorName, 410, y + 34);

      y += 90;

      // Divider line
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e0e0e0').lineWidth(1).stroke();
      y += 20;

      // Customer section
      doc.fillColor('#1a2744').fontSize(13).text('Customer Details', 50, y);
      y += 25;
      doc.fillColor('#333333').fontSize(11);
      doc.text('Name:', 70, y);
      doc.font('Helvetica-Bold').text(tenantName, 160, y);
      doc.font('Helvetica');
      y += 22;
      if (tenantEmail !== '-') {
        doc.fillColor('#333333').fontSize(10);
        doc.text('Email:', 70, y);
        doc.text(tenantEmail, 160, y);
        y += 20;
      }
      if (tenantPhone !== '-') {
        doc.fillColor('#333333').fontSize(10);
        doc.text('Phone:', 70, y);
        doc.text(tenantPhone, 160, y);
        y += 20;
      }
      y += 10;

      // Building & Unit section (if linked)
      if (buildingName !== '-' || unitNumber !== '-') {
        doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e0e0e0').lineWidth(1).stroke();
        y += 20;
        doc.fillColor('#1a2744').fontSize(13).text('Property Details', 50, y);
        y += 25;
        doc.fillColor('#333333').fontSize(11);
        if (buildingName !== '-') {
          doc.text('Building:', 70, y);
          doc.font('Helvetica-Bold').text(buildingName, 160, y);
          doc.font('Helvetica');
          y += 22;
        }
        if (unitNumber !== '-') {
          doc.text('Unit:', 70, y);
          doc.text(unitNumber, 160, y);
          y += 22;
        }
        if (rentAmount) {
          doc.text('Monthly Rent:', 70, y);
          doc.text(`${rentAmount} KWD`, 160, y);
          y += 22;
        }
        y += 10;
      }

      // Divider
      doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e0e0e0').lineWidth(1).stroke();
      y += 20;

      // Payment details table
      doc.fillColor('#1a2744').fontSize(13).text('Payment Details', 50, y);
      y += 25;

      // Table header
      doc.roundedRect(50, y, doc.page.width - 100, 30, 3).fill('#1a2744');
      doc.fillColor('#ffffff').fontSize(10);
      doc.text('Description', 70, y + 9);
      doc.text('Order No', 280, y + 9);
      doc.text('Amount', 430, y + 9);
      y += 30;

      // Table row
      doc.roundedRect(50, y, doc.page.width - 100, 35, 0).fill('#fafafa');
      doc.fillColor('#333333').fontSize(10);
      doc.text('Payment', 70, y + 11);
      doc.text(link.order_no, 280, y + 11);
      doc.font('Helvetica-Bold').fontSize(11).text(`${amount} KWD`, 430, y + 10);
      doc.font('Helvetica');
      y += 35;

      // Total
      doc.roundedRect(50, y, doc.page.width - 100, 40, 0).fill('#1a2744');
      doc.fillColor('#ffffff').fontSize(12);
      doc.text('TOTAL', 70, y + 13);
      doc.font('Helvetica-Bold').fontSize(14).text(`${amount} KWD`, 400, y + 12, { align: 'right', width: 100 });
      doc.font('Helvetica');

      y += 70;

      // Footer note
      doc.fillColor('#999999').fontSize(9).text(
        'This invoice is auto-generated. For any inquiries, please contact the property management office.',
        50, y, { align: 'center', width: doc.page.width - 100 }
      );

      doc.end();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get payment links for the logged-in tenant
   * GET /api/payments/my-payment-links
   */
  async getMyPaymentLinks(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await PaymentLink.findAndCountAll({
        where: { tenant_id: req.user.id },
        include: [
          { model: Unit, as: 'unit', attributes: ['id', 'unit_number'] },
          { model: Building, as: 'building', attributes: ['id', 'name_en', 'name_ar'] },
        ],
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
