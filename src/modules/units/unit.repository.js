const { Unit, Building, Tenancy } = require('../../models');
const { Op } = require('sequelize');
const { UNIT_STATUS } = require('../../shared/constants');

const BUILDING_INCLUDE = {
  model: Building,
  as: 'building',
  attributes: ['name', 'address', 'owner_id'],
};

/**
 * Unit Repository - Database operations (Sequelize)
 */
const unitRepository = {
  /**
   * Find unit by ID
   */
  async findById(id) {
    const unit = await Unit.findByPk(id, {
      include: [BUILDING_INCLUDE],
    });
    if (!unit) return null;
    const plain = unit.get({ plain: true });
    plain.building_name = plain.building?.name || null;
    plain.building_address = plain.building?.address || null;
    plain.owner_id = plain.building?.owner_id || null;
    delete plain.building;
    return plain;
  },

  /**
   * Find all units with pagination
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.buildingId) {
      where.building_id = filters.buildingId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.minBedrooms) {
      where.bedrooms = { [Op.gte]: filters.minBedrooms };
    }
    if (filters.maxRent) {
      where.rent_amount = { [Op.lte]: filters.maxRent };
    }
    if (filters.ownerId) {
      buildingWhere.owner_id = filters.ownerId;
    }

    const rows = await Unit.findAll({
      where,
      include: [{
        model: Building,
        as: 'building',
        attributes: ['name', 'address', 'owner_id'],
        where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
        required: Object.keys(buildingWhere).length > 0,
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return rows.map(u => {
      const plain = u.get({ plain: true });
      plain.building_name = plain.building?.name || null;
      plain.building_address = plain.building?.address || null;
      plain.owner_id = plain.building?.owner_id || null;
      delete plain.building;
      return plain;
    });
  },

  /**
   * Count total units
   */
  async count(filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.buildingId) {
      where.building_id = filters.buildingId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.minBedrooms) {
      where.bedrooms = { [Op.gte]: filters.minBedrooms };
    }
    if (filters.maxRent) {
      where.rent_amount = { [Op.lte]: filters.maxRent };
    }
    if (filters.ownerId) {
      buildingWhere.owner_id = filters.ownerId;
    }

    return Unit.count({
      where,
      include: Object.keys(buildingWhere).length ? [{
        model: Building,
        as: 'building',
        where: buildingWhere,
      }] : [],
    });
  },

  /**
   * Create new unit
   */
  async create(unitData) {
    const { buildingId, unitNumber, floor, bedrooms, bathrooms, area, rentAmount, type } = unitData;

    const unit = await Unit.create({
      building_id: buildingId,
      unit_number: unitNumber,
      floor: floor || null,
      bedrooms,
      bathrooms,
      area_sqft: area || null,
      rent_amount: rentAmount,
      type: type || 'APARTMENT',
      status: UNIT_STATUS.AVAILABLE,
    });

    return unit.id;
  },

  /**
   * Update unit
   */
  async update(id, unitData) {
    const updateData = {};

    if (unitData.buildingId) updateData.building_id = unitData.buildingId;
    if (unitData.unitNumber) updateData.unit_number = unitData.unitNumber;
    if (unitData.floor !== undefined) updateData.floor = unitData.floor;
    if (unitData.bedrooms !== undefined) updateData.bedrooms = unitData.bedrooms;
    if (unitData.bathrooms !== undefined) updateData.bathrooms = unitData.bathrooms;
    if (unitData.area !== undefined) updateData.area_sqft = unitData.area;
    if (unitData.rentAmount !== undefined) updateData.rent_amount = unitData.rentAmount;
    if (unitData.status) updateData.status = unitData.status;
    if (unitData.type) updateData.type = unitData.type;

    const [affectedCount] = await Unit.update(updateData, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Update unit status
   */
  async updateStatus(id, status) {
    const [affectedCount] = await Unit.update({ status }, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Soft delete unit (paranoid handles deleted_at automatically)
   */
  async softDelete(id) {
    const affectedCount = await Unit.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Check if unit has active tenancy
   */
  async hasActiveTenancy(id) {
    const count = await Tenancy.count({ where: { unit_id: id, is_active: true } });
    return count > 0;
  },

  /**
   * Find units by building ID
   */
  async findByBuildingId(buildingId) {
    const rows = await Unit.findAll({
      where: { building_id: buildingId },
      order: [['unit_number', 'ASC']],
    });
    return rows.map(r => r.get({ plain: true }));
  },
};

module.exports = unitRepository;
