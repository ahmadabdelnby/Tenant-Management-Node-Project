const maintenanceRepository = require('./maintenance.repository');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

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
};

module.exports = maintenanceService;
