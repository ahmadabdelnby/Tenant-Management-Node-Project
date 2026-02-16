const paymentRepository = require('./payment.repository');
const tahseeelService = require('./tahseeel.service');
const { notificationService } = require('../notifications');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');
const ExcelJS = require('exceljs');

/**
 * Payment Service - Business logic
 */
const paymentService = {
  /**
   * Format payment response
   */
  formatPayment(payment) {
    return {
      id: payment.id,
      tenancyId: payment.tenancy_id,
      month: payment.month,
      year: payment.year,
      amount: parseFloat(payment.amount),
      status: payment.status,
      paymentMethod: payment.payment_method,
      tahseeelPaymentLink: payment.tahseeel_payment_link,
      tahseeelTxStatus: payment.tahseeel_tx_status,
      paidAt: payment.paid_at,
      notes: payment.notes,
      unit: {
        id: payment.unit_id,
        unitNumber: payment.unit_number,
        buildingId: payment.building_id,
        buildingName: payment.building_name,
      },
      tenant: {
        id: payment.tenant_id,
        email: payment.tenant_email,
        firstName: payment.tenant_first_name,
        lastName: payment.tenant_last_name,
        phone: payment.tenant_phone,
      },
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    };
  },

  /**
   * Get all payments with pagination
   */
  async getAllPayments(page, limit, filters, user) {
    const offset = (page - 1) * limit;

    // Filter based on role
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    } else if (user.role === ROLES.TENANT) {
      filters.tenantId = user.id;
    }

    const [payments, total] = await Promise.all([
      paymentRepository.findAll(limit, offset, filters),
      paymentRepository.count(filters),
    ]);

    const formattedPayments = payments.map(p => this.formatPayment(p));
    return buildPaginationResponse(formattedPayments, page, limit, total);
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(id, user) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check access
    if (user.role === ROLES.OWNER && payment.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    if (user.role === ROLES.TENANT && payment.tenant_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    return this.formatPayment(payment);
  },

  /**
   * Generate monthly payment records for all active tenancies
   */
  async generateMonthlyPayments(month, year, userId) {
    // Mark overdue payments first
    const overdueCount = await paymentRepository.markOverduePayments();
    if (overdueCount > 0) {
      logger.info(`Marked ${overdueCount} payments as overdue`);
    }

    const created = await paymentRepository.generateMonthlyPayments(month, year);
    logger.info(`Generated ${created} payment records for ${month}/${year} by user ${userId}`);

    // Send notifications to tenants for newly generated payments
    if (created > 0) {
      try {
        const newPayments = await paymentRepository.findAll(1000, 0, { month, year, status: 'PENDING' });
        for (const payment of newPayments) {
          try {
            await notificationService.sendPaymentReminder(payment.tenant_id, {
              unitNumber: payment.unit_number,
              buildingName: payment.building_name,
              month: payment.month,
              year: payment.year,
              amount: parseFloat(payment.amount),
            });
          } catch (notifError) {
            logger.warn(`Failed to send payment reminder to tenant ${payment.tenant_id}:`, notifError.message);
          }
        }
        logger.info(`Sent payment reminder notifications for ${newPayments.length} payments`);
      } catch (error) {
        logger.warn('Failed to send payment reminder notifications:', error.message);
      }
    }

    return {
      message: `Generated ${created} payment records for ${month}/${year}`,
      created,
      overdueMarked: overdueCount,
    };
  },

  /**
   * Update payment (mark as paid, change status, etc.)
   */
  async updatePayment(id, data, user) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Only admin and owner can update
    if (user.role === ROLES.OWNER && payment.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    // If marking as PAID, set paidAt
    if (data.status === 'PAID' && !data.paidAt) {
      data.paidAt = new Date();
    }

    await paymentRepository.update(id, data);
    logger.info(`Payment ${id} updated by user ${user.id}`);

    // Send confirmation notification if marked as paid
    if (data.status === 'PAID') {
      try {
        await notificationService.sendPaymentConfirmation(payment.tenant_id, {
          unitNumber: payment.unit_number,
          buildingName: payment.building_name,
          month: payment.month,
          year: payment.year,
          amount: parseFloat(payment.amount),
        });
      } catch (notifError) {
        logger.warn('Failed to send payment confirmation notification:', notifError.message);
      }
    }

    return this.getPaymentById(id, { role: ROLES.ADMIN });
  },

  /**
   * Create Tahseeel payment link for a payment
   */
  async createPaymentLink(paymentId, user) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Only admin and owner of the building can create payment links
    if (user.role === ROLES.OWNER && payment.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    if (payment.status === 'PAID') {
      throw new AppError('Payment is already marked as paid', HTTP_STATUS.BAD_REQUEST);
    }

    // Create Tahseeel order
    const orderNo = `PAY-${paymentId}-${Date.now()}`;
    const result = await tahseeelService.createOrder({
      orderNo,
      amount: parseFloat(payment.amount),
      customerName: `${payment.tenant_first_name} ${payment.tenant_last_name}`,
      customerEmail: payment.tenant_email,
      customerMobile: payment.tenant_phone,
      phoneCode: '965',
      remarks: `Rent payment for ${payment.unit_number} - ${payment.building_name} (${payment.month}/${payment.year})`,
    });

    if (!result.success) {
      throw new AppError(result.error || 'Failed to create payment link', HTTP_STATUS.BAD_GATEWAY);
    }

    // Extract hash and inv_id from the link URL
    let hash = null;
    let invId = null;
    try {
      const url = new URL(result.link);
      hash = url.searchParams.get('hash');
      invId = url.searchParams.get('id');
    } catch (e) {
      logger.warn('Could not parse Tahseeel link URL:', result.link);
    }

    // Update payment record with Tahseeel info
    await paymentRepository.update(paymentId, {
      tahseeelOrderNo: orderNo,
      tahseeelHash: hash,
      tahseeelInvId: invId,
      tahseeelPaymentLink: result.link,
      paymentMethod: 'TAHSEEEL',
    });

    logger.info(`Tahseeel payment link created for payment ${paymentId}: ${result.link}`);

    // Send notification to tenant
    try {
      await notificationService.sendPaymentLinkNotification(payment.tenant_id, result.link, {
        unitNumber: payment.unit_number,
        buildingName: payment.building_name,
        month: payment.month,
        year: payment.year,
        amount: parseFloat(payment.amount),
      });
    } catch (notifError) {
      logger.warn('Failed to send payment link notification:', notifError.message);
    }

    return {
      paymentId,
      link: result.link,
      orderNo,
    };
  },

  /**
   * Handle Tahseeel callback after payment
   */
  async handleTahseeelCallback(callbackData) {
    const parsed = tahseeelService.parseCallback(callbackData);
    logger.info('Tahseeel callback received:', JSON.stringify(parsed));

    // Find the payment by the order_no which contains our payment ID
    // The order_no format is: PAY-{paymentId}-{timestamp}
    const orderNo = callbackData.order_id || '';
    
    // Try to find by hash
    if (parsed.hash) {
      const { pool } = require('../../config/database');
      const [rows] = await pool.execute(
        'SELECT id FROM payments WHERE tahseeel_hash = ?',
        [parsed.hash]
      );

      if (rows.length > 0) {
        const paymentId = rows[0].id;

        const updateData = {
          tahseeelTxId: parsed.txId,
          tahseeelPaymentId: parsed.paymentId,
          tahseeelResult: parsed.result,
          tahseeelTxStatus: parsed.txStatus,
        };

        if (parsed.isSuccess) {
          updateData.status = 'PAID';
          updateData.paidAt = new Date();
          logger.info(`Payment ${paymentId} marked as PAID via Tahseeel`);
        } else if (parsed.cancelled) {
          logger.info(`Payment ${paymentId} cancelled by user`);
        } else {
          logger.info(`Payment ${paymentId} Tahseeel status: ${parsed.txStatus}`);
        }

        await paymentRepository.update(paymentId, updateData);

        return { paymentId, success: parsed.isSuccess, status: parsed.txStatus };
      }
    }

    logger.warn('Could not find payment for Tahseeel callback:', JSON.stringify(callbackData));
    return { success: false, error: 'Payment not found for callback' };
  },

  /**
   * Get building payment summary for a specific month
   */
  async getBuildingPaymentSummary(buildingId, month, year, user) {
    // Check access for owners
    if (user.role === ROLES.OWNER) {
      const { pool } = require('../../config/database');
      const [rows] = await pool.execute(
        'SELECT owner_id FROM buildings WHERE id = ?',
        [buildingId]
      );
      if (!rows[0] || rows[0].owner_id !== user.id) {
        throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
      }
    }

    const summary = await paymentRepository.getBuildingPaymentSummary(buildingId, month, year);

    const totalExpected = summary.reduce((sum, r) => sum + parseFloat(r.monthly_rent || 0), 0);
    const totalPaid = summary.filter(r => r.payment_status === 'PAID')
      .reduce((sum, r) => sum + parseFloat(r.payment_amount || 0), 0);
    const totalPending = summary.filter(r => !r.payment_status || r.payment_status === 'PENDING').length;
    const totalOverdue = summary.filter(r => r.payment_status === 'OVERDUE').length;

    return {
      buildingId,
      month,
      year,
      summary: {
        totalTenants: summary.length,
        totalExpected,
        totalPaid,
        totalPending,
        totalOverdue,
        paidCount: summary.filter(r => r.payment_status === 'PAID').length,
      },
      tenants: summary.map(r => ({
        tenancyId: r.tenancy_id,
        unitNumber: r.unit_number,
        tenantName: `${r.tenant_first_name} ${r.tenant_last_name}`,
        tenantEmail: r.tenant_email,
        tenantPhone: r.tenant_phone,
        monthlyRent: parseFloat(r.monthly_rent),
        paymentId: r.payment_id,
        paymentAmount: r.payment_amount ? parseFloat(r.payment_amount) : null,
        paymentStatus: r.payment_status || 'NO_RECORD',
        paymentMethod: r.payment_method,
        paidAt: r.paid_at,
        tahseeelPaymentLink: r.tahseeel_payment_link,
        notes: r.notes,
      })),
    };
  },

  /**
   * Export payments to Excel
   */
  async exportToExcel(filters, user) {
    // Apply role-based filters
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    }

    const payments = await paymentRepository.findAllForExport(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PropertyMS';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Payment Report', {
      headerFooter: {
        firstHeader: 'Payment Report',
      },
    });

    // Define columns
    sheet.columns = [
      { header: 'Building', key: 'building', width: 20 },
      { header: 'Unit', key: 'unit', width: 12 },
      { header: 'Tenant Name', key: 'tenantName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Month', key: 'month', width: 8 },
      { header: 'Year', key: 'year', width: 8 },
      { header: 'Amount (KWD)', key: 'amount', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Payment Method', key: 'paymentMethod', width: 16 },
      { header: 'Paid At', key: 'paidAt', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A365D' }, // Navy color
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    payments.forEach(p => {
      const row = sheet.addRow({
        building: p.building_name,
        unit: p.unit_number,
        tenantName: `${p.tenant_first_name} ${p.tenant_last_name}`,
        email: p.tenant_email,
        phone: p.tenant_phone || '-',
        month: p.month,
        year: p.year,
        amount: parseFloat(p.amount),
        status: p.status,
        paymentMethod: p.payment_method || '-',
        paidAt: p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-US') : '-',
        notes: p.notes || '-',
      });

      // Color code status
      const statusCell = row.getCell('status');
      switch (p.status) {
        case 'PAID':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
          statusCell.font = { color: { argb: 'FF155724' } };
          break;
        case 'OVERDUE':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
          statusCell.font = { color: { argb: 'FF721C24' } };
          break;
        case 'PENDING':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
          statusCell.font = { color: { argb: 'FF856404' } };
          break;
      }
    });

    // Add auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `L${payments.length + 1}`,
    };

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A365D' },
    };

    const totalPaid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + parseFloat(p.amount), 0);
    const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + parseFloat(p.amount), 0);
    const totalOverdue = payments.filter(p => p.status === 'OVERDUE').reduce((s, p) => s + parseFloat(p.amount), 0);

    summarySheet.addRow({ metric: 'Total Records', value: payments.length });
    summarySheet.addRow({ metric: 'Paid', value: payments.filter(p => p.status === 'PAID').length });
    summarySheet.addRow({ metric: 'Pending', value: payments.filter(p => p.status === 'PENDING').length });
    summarySheet.addRow({ metric: 'Overdue', value: payments.filter(p => p.status === 'OVERDUE').length });
    summarySheet.addRow({ metric: 'Total Paid Amount (KWD)', value: totalPaid.toFixed(3) });
    summarySheet.addRow({ metric: 'Total Pending Amount (KWD)', value: totalPending.toFixed(3) });
    summarySheet.addRow({ metric: 'Total Overdue Amount (KWD)', value: totalOverdue.toFixed(3) });
    summarySheet.addRow({ metric: 'Report Generated', value: new Date().toLocaleString('en-US') });

    return workbook;
  },
};

module.exports = paymentService;
