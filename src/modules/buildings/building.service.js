const buildingRepository = require('./building.repository');
const { userRepository } = require('../users');
const { AppError, NotFoundError, AuthorizationError } = require('../../shared/errors');
const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../../shared/constants');
const { buildPaginationResponse } = require('../../shared/utils/paginationHelper');
const logger = require('../../shared/utils/logger');

/**
 * Building Service - Business logic
 */
const buildingService = {
  /**
   * Format building response
   */
  formatBuilding(building) {
    return {
      id: building.id,
      name: building.name,
      address: building.address,
      city: building.city,
      postalCode: building.postal_code,
      country: building.country,
      totalUnits: building.total_units || 0,
      owner: building.owner_id ? {
        id: building.owner_id,
        email: building.owner_email,
        firstName: building.owner_first_name,
        lastName: building.owner_last_name,
      } : null,
      createdAt: building.created_at,
      updatedAt: building.updated_at,
    };
  },
  
  /**
   * Get all buildings with pagination
   */
  async getAllBuildings(page, limit, filters, user) {
    const offset = (page - 1) * limit;
    
    // If user is Owner, only show their buildings
    if (user.role === ROLES.OWNER) {
      filters.ownerId = user.id;
    }
    
    const [buildings, total] = await Promise.all([
      buildingRepository.findAll(limit, offset, filters),
      buildingRepository.count(filters),
    ]);
    
    const formattedBuildings = buildings.map(b => this.formatBuilding(b));
    
    return buildPaginationResponse(formattedBuildings, page, limit, total);
  },
  
  /**
   * Get building by ID
   */
  async getBuildingById(id, user) {
    const building = await buildingRepository.findById(id);
    
    if (!building) {
      throw new NotFoundError(ERROR_MESSAGES.BUILDING_NOT_FOUND);
    }
    
    // Check ownership for non-admin users
    if (user.role === ROLES.OWNER && building.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    return this.formatBuilding(building);
  },
  
  /**
   * Create new building (Admin only)
   */
  async createBuilding(buildingData) {
    // Verify owner exists and has OWNER role
    const owner = await userRepository.findById(buildingData.ownerId);
    if (!owner) {
      throw new AppError('Owner not found', HTTP_STATUS.BAD_REQUEST);
    }
    if (owner.role !== ROLES.OWNER) {
      throw new AppError('Specified user is not an Owner', HTTP_STATUS.BAD_REQUEST);
    }
    
    const buildingId = await buildingRepository.create(buildingData);
    
    logger.info(`Building created: ${buildingData.name} with ID: ${buildingId}`);
    
    return this.getBuildingById(buildingId, { role: ROLES.ADMIN });
  },
  
  /**
   * Update building
   */
  async updateBuilding(id, buildingData, user) {
    const building = await buildingRepository.findById(id);
    
    if (!building) {
      throw new NotFoundError(ERROR_MESSAGES.BUILDING_NOT_FOUND);
    }
    
    // Check ownership for non-admin users
    if (user.role === ROLES.OWNER && building.owner_id !== user.id) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }
    
    // Only Admin can change owner
    if (buildingData.ownerId && user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Only Admin can change building owner');
    }
    
    // Verify new owner if being changed
    if (buildingData.ownerId) {
      const newOwner = await userRepository.findById(buildingData.ownerId);
      if (!newOwner) {
        throw new AppError('New owner not found', HTTP_STATUS.BAD_REQUEST);
      }
      if (newOwner.role !== ROLES.OWNER) {
        throw new AppError('Specified user is not an Owner', HTTP_STATUS.BAD_REQUEST);
      }
    }
    
    await buildingRepository.update(id, buildingData);
    
    logger.info(`Building updated: ID ${id}`);
    
    return this.getBuildingById(id, { role: ROLES.ADMIN });
  },
  
  /**
   * Delete building (Admin only)
   */
  async deleteBuilding(id) {
    const building = await buildingRepository.findById(id);
    
    if (!building) {
      throw new NotFoundError(ERROR_MESSAGES.BUILDING_NOT_FOUND);
    }
    
    // Check if building has units
    const hasUnits = await buildingRepository.hasUnits(id);
    if (hasUnits) {
      throw new AppError(ERROR_MESSAGES.BUILDING_HAS_UNITS, HTTP_STATUS.CONFLICT);
    }
    
    await buildingRepository.softDelete(id);
    
    logger.info(`Building deleted: ID ${id}`);
    
    return { message: 'Building deleted successfully' };
  },
};

module.exports = buildingService;
