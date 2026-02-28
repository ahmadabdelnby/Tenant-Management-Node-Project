const unitRepository = require('./unit.repository');
const { buildingRepository } = require('../buildings');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

/**
 * Unit Service - Business logic
 */
const unitService = {
  /**
   * Format unit response
   */
  formatUnit(unit) {
    return {
      id: unit.id,
      unitNumber: unit.unit_number,
      floor: unit.floor,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      areaSqft: unit.area_sqft,
      area: parseFloat(unit.area_sqft),
      type: unit.type,
      rentAmount: parseFloat(unit.rent_amount),
      status: unit.status,
      buildingId: unit.building_id,
      building: {
        id: unit.building_id,
        name: unit.building_name,
        nameEn: unit.building_name_en,
        nameAr: unit.building_name_ar,
        address: unit.building_address,
      },
      createdAt: unit.created_at,
      updatedAt: unit.updated_at,
    };
  },
  
  /**
   * Get all units with pagination
   */
  async getAllUnits(page, limit, filters, user) {
    const offset = (page - 1) * limit;
    
    // If user is Owner, only show their buildings' units
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    }
    
    const [units, total] = await Promise.all([
      unitRepository.findAll(limit, offset, filters),
      unitRepository.count(filters),
    ]);
    
    const formattedUnits = units.map(u => this.formatUnit(u));
    
    return buildPaginationResponse(formattedUnits, page, limit, total);
  },
  
  /**
   * Get unit by ID
   */
  async getUnitById(id, user) {
    const unit = await unitRepository.findById(id);
    
    if (!unit) {
      throw new NotFoundError(ERROR_MESSAGES.UNIT_NOT_FOUND);
    }
    
    // Check ownership for non-admin users
    if (user.role === ROLES.OWNER && unit.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    return this.formatUnit(unit);
  },
  
  /**
   * Create new unit (Admin only)
   */
  async createUnit(unitData) {
    // Verify building exists
    const building = await buildingRepository.findById(unitData.buildingId);
    if (!building) {
      throw new AppError(ERROR_MESSAGES.BUILDING_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    
    const unitId = await unitRepository.create(unitData);
    
    logger.info(`Unit created: ${unitData.unitNumber} in building ${unitData.buildingId} with ID: ${unitId}`);
    
    return this.getUnitById(unitId, { role: ROLES.ADMIN });
  },
  
  /**
   * Update unit
   */
  async updateUnit(id, unitData, user) {
    const unit = await unitRepository.findById(id);
    
    if (!unit) {
      throw new NotFoundError(ERROR_MESSAGES.UNIT_NOT_FOUND);
    }
    
    // Check ownership for non-admin users
    if (user.role === ROLES.OWNER && unit.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    // Prevent manually setting status to RENTED (only tenancy can do that)
    if (unitData.status === 'RENTED') {
      throw new AppError('Unit status RENTED can only be set through tenancy management', HTTP_STATUS.BAD_REQUEST);
    }

    // If unit is currently RENTED, don't allow status change via this endpoint
    if (unit.status === 'RENTED' && unitData.status && unitData.status !== 'RENTED') {
      throw new AppError('Cannot change status of a rented unit. End or delete the tenancy first.', HTTP_STATUS.CONFLICT);
    }
    
    await unitRepository.update(id, unitData);
    
    logger.info(`Unit updated: ID ${id}`);
    
    return this.getUnitById(id, { role: ROLES.ADMIN });
  },
  
  /**
   * Delete unit (Admin only)
   */
  async deleteUnit(id) {
    const unit = await unitRepository.findById(id);
    
    if (!unit) {
      throw new NotFoundError(ERROR_MESSAGES.UNIT_NOT_FOUND);
    }
    
    // Check if unit has active tenancy
    const hasActiveTenancy = await unitRepository.hasActiveTenancy(id);
    if (hasActiveTenancy) {
      throw new AppError(ERROR_MESSAGES.UNIT_HAS_ACTIVE_TENANCY, HTTP_STATUS.CONFLICT);
    }
    
    await unitRepository.softDelete(id);
    
    logger.info(`Unit deleted: ID ${id}`);
    
    return { message: 'Unit deleted successfully' };
  },
  
  /**
   * Get units by building ID
   */
  async getUnitsByBuildingId(buildingId, user) {
    // Verify building exists and user has access
    const building = await buildingRepository.findById(buildingId);
    
    if (!building) {
      throw new NotFoundError(ERROR_MESSAGES.BUILDING_NOT_FOUND);
    }
    
    // Check ownership for non-admin users
    if (user.role === ROLES.OWNER && building.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    const units = await unitRepository.findByBuildingId(buildingId);
    
    return units.map(u => ({
      id: u.id,
      unitNumber: u.unit_number,
      floor: u.floor,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      areaSqft: u.area_sqft,
      rentAmount: parseFloat(u.rent_amount),
      status: u.status,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));
  },
};

module.exports = unitService;
