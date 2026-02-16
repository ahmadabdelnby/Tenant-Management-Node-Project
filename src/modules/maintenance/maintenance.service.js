const maintenanceRepository = require('./maintenance.repository');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');
const ExcelJS = require('exceljs');

/**
 * Maintenance Service - Business logic
 */
const maintenanceService = {
  /**
   * Format maintenance request response
   */
  formatRequest(request) {
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      status: request.status,
      resolutionNotes: request.resolution_notes,
      resolvedAt: request.resolved_at,
      resolvedBy: request.resolved_by ? {
        id: request.resolved_by,
        name: `${request.resolver_first_name || ''} ${request.resolver_last_name || ''}`.trim(),
      } : null,
      unit: {
        id: request.unit_id,
        unitNumber: request.unit_number,
        buildingId: request.building_id,
        buildingName: request.building_name,
      },
      tenant: {
        id: request.tenant_id,
        email: request.tenant_email,
        firstName: request.tenant_first_name,
        lastName: request.tenant_last_name,
      },
      createdAt: request.created_at,
      updatedAt: request.updated_at,
    };
  },
  
  /**
   * Get all maintenance requests with pagination
   */
  async getAllRequests(page, limit, filters, user) {
    const offset = (page - 1) * limit;
    
    // Filter based on role
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    } else if (user.role === ROLES.TENANT) {
      filters.tenantId = user.id;
    }
    
    const [requests, total] = await Promise.all([
      maintenanceRepository.findAll(limit, offset, filters),
      maintenanceRepository.count(filters),
    ]);
    
    const formattedRequests = requests.map(r => this.formatRequest(r));
    
    return buildPaginationResponse(formattedRequests, page, limit, total);
  },
  
  /**
   * Get maintenance request by ID
   */
  async getRequestById(id, user) {
    const request = await maintenanceRepository.findById(id);
    
    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }
    
    // Check access based on role
    if (user.role === ROLES.OWNER && request.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    if (user.role === ROLES.TENANT && request.tenant_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    return this.formatRequest(request);
  },
  
  /**
   * Create new maintenance request (Tenant only)
   */
  async createRequest(requestData, user) {
    let unitId = requestData.unitId;
    
    // If unitId is provided, verify tenant has access to this unit
    if (unitId) {
      const hasAccess = await maintenanceRepository.verifyTenantUnit(user.id, unitId);
      if (!hasAccess) {
        throw new AppError('You do not have an active tenancy for this unit', HTTP_STATUS.BAD_REQUEST);
      }
    } else {
      // If no unitId provided, get tenant's first active tenancy unit
      const tenantUnit = await maintenanceRepository.getTenantUnit(user.id);
      
      if (!tenantUnit) {
        throw new AppError('You do not have an active tenancy', HTTP_STATUS.BAD_REQUEST);
      }
      
      unitId = tenantUnit.unit_id;
    }
    
    const newRequest = {
      tenantId: user.id,
      unitId: unitId,
      title: requestData.title,
      description: requestData.description,
      category: requestData.category,
      priority: requestData.priority,
    };
    
    const requestId = await maintenanceRepository.create(newRequest);
    
    logger.info(`Maintenance request created: ID ${requestId} by tenant ${user.id} for unit ${unitId}`);
    
    return this.getRequestById(requestId, { role: ROLES.ADMIN });
  },
  
  /**
   * Update maintenance request status (Admin/Owner only)
   */
  async updateRequest(id, requestData, user) {
    const request = await maintenanceRepository.findById(id);
    
    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }
    
    // Check access for owners
    if (user.role === ROLES.OWNER && request.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    // Tenants can only cancel their own pending requests
    if (user.role === ROLES.TENANT) {
      if (request.tenant_id !== user.id) {
        throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
      }
      if (request.status !== 'PENDING' || requestData.status !== 'CANCELLED') {
        throw new AppError('You can only cancel pending requests', HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    // If status is being set to COMPLETED, set resolution data
    if (requestData.status === 'COMPLETED') {
      requestData.resolvedBy = user.id;
      requestData.resolvedAt = new Date();
    }
    
    await maintenanceRepository.update(id, requestData);
    
    logger.info(`Maintenance request updated: ID ${id} by user ${user.id}`);
    
    return this.getRequestById(id, { role: ROLES.ADMIN });
  },
  
  /**
   * Delete maintenance request (Admin only)
   */
  async deleteRequest(id) {
    const request = await maintenanceRepository.findById(id);
    
    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }
    
    await maintenanceRepository.delete(id);
    
    logger.info(`Maintenance request deleted: ID ${id}`);
  },

  /**
   * Export maintenance requests to Excel
   */
  async exportToExcel(filters, user) {
    // Apply role-based filters
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    } else if (user.role === ROLES.TENANT) {
      filters.tenantId = user.id;
    }

    const requests = await maintenanceRepository.findAllForExport(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PropertyMS';
    workbook.created = new Date();

    // ===== Main Report Sheet =====
    const sheet = workbook.addWorksheet('Maintenance Report', {
      headerFooter: { firstHeader: 'Maintenance Report' },
    });

    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Building', key: 'building', width: 20 },
      { header: 'Unit', key: 'unit', width: 12 },
      { header: 'Tenant Name', key: 'tenantName', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 14 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Resolution Notes', key: 'resolutionNotes', width: 35 },
      { header: 'Resolved By', key: 'resolvedBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Resolved At', key: 'resolvedAt', width: 20 },
    ];

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF1A365D' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    requests.forEach(r => {
      const row = sheet.addRow({
        id: r.id,
        building: r.building_name || '-',
        unit: r.unit_number || '-',
        tenantName: `${r.tenant_first_name || ''} ${r.tenant_last_name || ''}`.trim() || '-',
        phone: r.tenant_phone || '-',
        title: r.title,
        category: r.category,
        priority: r.priority,
        status: r.status?.replace('_', ' '),
        description: r.description || '-',
        resolutionNotes: r.resolution_notes || '-',
        resolvedBy: r.resolver_first_name ? `${r.resolver_first_name} ${r.resolver_last_name}`.trim() : '-',
        createdAt: formatDate(r.created_at),
        resolvedAt: formatDate(r.resolved_at),
      });

      // Color code status
      const statusCell = row.getCell('status');
      switch (r.status) {
        case 'COMPLETED':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
          statusCell.font = { color: { argb: 'FF155724' } };
          break;
        case 'PENDING':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
          statusCell.font = { color: { argb: 'FF856404' } };
          break;
        case 'IN_PROGRESS':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } };
          statusCell.font = { color: { argb: 'FF004085' } };
          break;
        case 'CANCELLED':
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3E5' } };
          statusCell.font = { color: { argb: 'FF383D41' } };
          break;
      }

      // Color code priority
      const priorityCell = row.getCell('priority');
      switch (r.priority) {
        case 'URGENT':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
          priorityCell.font = { bold: true, color: { argb: 'FF721C24' } };
          break;
        case 'HIGH':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
          priorityCell.font = { color: { argb: 'FF856404' } };
          break;
        case 'MEDIUM':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } };
          priorityCell.font = { color: { argb: 'FF004085' } };
          break;
        case 'LOW':
          priorityCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3E5' } };
          priorityCell.font = { color: { argb: 'FF6C757D' } };
          break;
      }
    });

    // Add auto-filter
    sheet.autoFilter = { from: 'A1', to: `N${requests.length + 1}` };

    // ===== Summary Sheet =====
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    const summaryHeaderRow = summarySheet.getRow(1);
    summaryHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    summaryHeaderRow.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FF1A365D' },
    };

    const totalRequests = requests.length;
    const pending = requests.filter(r => r.status === 'PENDING').length;
    const inProgress = requests.filter(r => r.status === 'IN_PROGRESS').length;
    const completed = requests.filter(r => r.status === 'COMPLETED').length;
    const cancelled = requests.filter(r => r.status === 'CANCELLED').length;
    const urgent = requests.filter(r => r.priority === 'URGENT').length;
    const high = requests.filter(r => r.priority === 'HIGH').length;

    summarySheet.addRow({ metric: 'Total Requests', value: totalRequests });
    summarySheet.addRow({ metric: 'Pending', value: pending });
    summarySheet.addRow({ metric: 'In Progress', value: inProgress });
    summarySheet.addRow({ metric: 'Completed', value: completed });
    summarySheet.addRow({ metric: 'Cancelled', value: cancelled });
    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Urgent Priority', value: urgent });
    summarySheet.addRow({ metric: 'High Priority', value: high });
    summarySheet.addRow({ metric: '', value: '' });

    // Category breakdown
    const categories = ['PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL', 'OTHER'];
    categories.forEach(cat => {
      const count = requests.filter(r => r.category === cat).length;
      if (count > 0) {
        summarySheet.addRow({ metric: `Category: ${cat}`, value: count });
      }
    });

    summarySheet.addRow({ metric: '', value: '' });
    summarySheet.addRow({ metric: 'Report Generated', value: new Date().toLocaleString('en-US') });

    return workbook;
  },
};

module.exports = maintenanceService;
