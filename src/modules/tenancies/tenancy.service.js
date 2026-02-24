const tenancyRepository = require('./tenancy.repository');
const { unitRepository } = require('../units');
const { userRepository } = require('../users');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES, UNIT_STATUS } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

/**
 * Tenancy Service - Business logic
 */
const tenancyService = {
  /**
   * Format tenancy response
   */
  formatTenancy(tenancy) {
    return {
      id: tenancy.id,
      startDate: tenancy.start_date,
      endDate: tenancy.end_date,
      monthlyRent: parseFloat(tenancy.monthly_rent),
      depositAmount: parseFloat(tenancy.deposit_amount),
      isActive: Boolean(tenancy.is_active),
      unit: {
        id: tenancy.unit_id,
        unitNumber: tenancy.unit_number,
        buildingId: tenancy.building_id,
        buildingName: tenancy.building_name,
        buildingMapEmbed: tenancy.building_map_embed || null,
      },
      tenant: {
        id: tenancy.tenant_id,
        email: tenancy.tenant_email,
        firstName: tenancy.tenant_first_name,
        lastName: tenancy.tenant_last_name,
      },
      createdAt: tenancy.created_at,
      updatedAt: tenancy.updated_at,
    };
  },
  
  /**
   * Get all tenancies with pagination
   */
  async getAllTenancies(page, limit, filters, user) {
    const offset = (page - 1) * limit;
    
    // Filter based on role
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    } else if (user.role === ROLES.TENANT) {
      filters.tenantId = user.id;
    }
    
    const [tenancies, total] = await Promise.all([
      tenancyRepository.findAll(limit, offset, filters),
      tenancyRepository.count(filters),
    ]);
    
    const formattedTenancies = tenancies.map(t => this.formatTenancy(t));
    
    return buildPaginationResponse(formattedTenancies, page, limit, total);
  },
  
  /**
   * Get tenancy by ID
   */
  async getTenancyById(id, user) {
    const tenancy = await tenancyRepository.findById(id);
    
    if (!tenancy) {
      throw new NotFoundError(ERROR_MESSAGES.TENANCY_NOT_FOUND);
    }
    
    // Check access based on role
    if (user.role === ROLES.OWNER && tenancy.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    if (user.role === ROLES.TENANT && tenancy.tenant_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    return this.formatTenancy(tenancy);
  },
  
  /**
   * Create new tenancy (Admin only)
   */
  async createTenancy(tenancyData) {
    // Verify unit exists
    const unit = await unitRepository.findById(tenancyData.unitId);
    if (!unit) {
      throw new AppError(ERROR_MESSAGES.UNIT_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
    // Check if unit is available
    if (unit.status !== UNIT_STATUS.AVAILABLE) {
      throw new AppError(ERROR_MESSAGES.UNIT_NOT_AVAILABLE, HTTP_STATUS.CONFLICT);
    }
    
    // Check if unit already has active tenancy
    const activeTenancy = await tenancyRepository.findActiveByUnitId(tenancyData.unitId);
    if (activeTenancy) {
      throw new AppError(ERROR_MESSAGES.TENANCY_ALREADY_ACTIVE, HTTP_STATUS.CONFLICT);
    }
    
    // Verify tenant exists and has TENANT role
    const tenant = await userRepository.findById(tenancyData.tenantId);
    if (!tenant) {
      throw new AppError('Tenant not found', HTTP_STATUS.BAD_REQUEST);
    }
    if (tenant.role !== ROLES.TENANT) {
      throw new AppError('Specified user is not a Tenant', HTTP_STATUS.BAD_REQUEST);
    }
    
    // Create tenancy
    const tenancyId = await tenancyRepository.create(tenancyData);
    
    // Update unit status to RENTED
    await unitRepository.updateStatus(tenancyData.unitId, UNIT_STATUS.RENTED);
    
    logger.info(`Tenancy created: ID ${tenancyId} for unit ${tenancyData.unitId}`);
    
    return this.getTenancyById(tenancyId, { role: ROLES.ADMIN });
  },
  
  /**
   * Update tenancy (Admin only)
   */
  async updateTenancy(id, tenancyData) {
    const tenancy = await tenancyRepository.findById(id);
    
    if (!tenancy) {
      throw new NotFoundError(ERROR_MESSAGES.TENANCY_NOT_FOUND);
    }
    
    // Validate end date if being updated
    if (tenancyData.endDate) {
      const newEndDate = new Date(tenancyData.endDate);
      const startDate = new Date(tenancy.start_date);
      
      if (newEndDate <= startDate) {
        throw new AppError(ERROR_MESSAGES.INVALID_TENANCY_DATES, HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    await tenancyRepository.update(id, tenancyData);
    
    // Sync unit status when isActive changes
    if (tenancyData.isActive !== undefined) {
      const wasActive = Boolean(tenancy.is_active);
      const nowActive = Boolean(tenancyData.isActive);
      
      if (wasActive && !nowActive) {
        // Tenancy deactivated → unit becomes AVAILABLE
        await unitRepository.updateStatus(tenancy.unit_id, UNIT_STATUS.AVAILABLE);
        logger.info(`Unit ${tenancy.unit_id} status changed to AVAILABLE (tenancy ${id} deactivated)`);
      } else if (!wasActive && nowActive) {
        // Tenancy reactivated → unit becomes RENTED
        await unitRepository.updateStatus(tenancy.unit_id, UNIT_STATUS.RENTED);
        logger.info(`Unit ${tenancy.unit_id} status changed to RENTED (tenancy ${id} reactivated)`);
      }
    }
    
    logger.info(`Tenancy updated: ID ${id}`);
    
    return this.getTenancyById(id, { role: ROLES.ADMIN });
  },
  
  /**
   * End tenancy (Admin only)
   */
  async endTenancy(id) {
    const tenancy = await tenancyRepository.findById(id);
    
    if (!tenancy) {
      throw new NotFoundError(ERROR_MESSAGES.TENANCY_NOT_FOUND);
    }
    
    if (!tenancy.is_active) {
      throw new AppError(ERROR_MESSAGES.TENANCY_ALREADY_ENDED, HTTP_STATUS.BAD_REQUEST);
    }
    
    // End tenancy
    await tenancyRepository.endTenancy(id);
    
    // Update unit status to AVAILABLE
    await unitRepository.updateStatus(tenancy.unit_id, UNIT_STATUS.AVAILABLE);
    
    logger.info(`Tenancy ended: ID ${id}`);
    
    return { message: 'Tenancy ended successfully' };
  },

  /**
   * Delete tenancy (Admin only)
   */
  async deleteTenancy(id) {
    const tenancy = await tenancyRepository.findById(id);

    if (!tenancy) {
      throw new NotFoundError(ERROR_MESSAGES.TENANCY_NOT_FOUND);
    }

    // If tenancy was active, release the unit
    if (Boolean(tenancy.is_active)) {
      await unitRepository.updateStatus(tenancy.unit_id, UNIT_STATUS.AVAILABLE);
      logger.info(`Unit ${tenancy.unit_id} status changed to AVAILABLE (tenancy ${id} deleted)`);
    }

    await tenancyRepository.delete(id);

    logger.info(`Tenancy deleted: ID ${id}`);

    return { message: 'Tenancy deleted successfully' };
  },
  
  /**
   * Get current user's tenancies (for Tenant role)
   */
  async getMyTenancies(userId) {
    const tenancies = await tenancyRepository.findByTenantId(userId);
    
    return tenancies.map(t => ({
      id: t.id,
      startDate: t.start_date,
      endDate: t.end_date,
      monthlyRent: parseFloat(t.monthly_rent),
      depositAmount: parseFloat(t.deposit_amount),
      isActive: Boolean(t.is_active),
      unit: {
        id: t.unit_id,
        unitNumber: t.unit_number,
        buildingId: t.building_id,
        buildingName: t.building_name,
        buildingAddress: t.building_address,
      },
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  },
};

module.exports = tenancyService;
