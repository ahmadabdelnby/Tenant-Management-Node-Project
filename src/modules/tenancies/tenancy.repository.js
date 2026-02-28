const { Tenancy, Unit, Building, User } = require('../../models');
const { Op } = require('sequelize');

const FULL_INCLUDE = [
  {
    model: Unit,
    as: 'unit',
    attributes: ['unit_number', 'building_id'],
    include: [{
      model: Building,
      as: 'building',
      attributes: ['name_en', 'name_ar', 'owner_id', 'address', 'map_embed'],
    }],
  },
  {
    model: User,
    as: 'tenant',
    attributes: ['email', 'first_name', 'last_name'],
  },
];

/**
 * Helper to flatten nested includes for backward compatibility
 */
function flattenTenancy(plain) {
  plain.unit_number = plain.unit?.unit_number || null;
  plain.building_id = plain.unit?.building_id || null;
  plain.building_name = plain.unit?.building?.name_en || null;
  plain.building_name_en = plain.unit?.building?.name_en || null;
  plain.building_name_ar = plain.unit?.building?.name_ar || null;
  plain.building_address = plain.unit?.building?.address || null;
  plain.building_map_embed = plain.unit?.building?.map_embed || null;
  plain.owner_id = plain.unit?.building?.owner_id || null;
  plain.tenant_email = plain.tenant?.email || null;
  plain.tenant_first_name = plain.tenant?.first_name || null;
  plain.tenant_last_name = plain.tenant?.last_name || null;
  delete plain.unit;
  delete plain.tenant;
  return plain;
}

/**
 * Tenancy Repository - Database operations (Sequelize)
 */
const tenancyRepository = {
  /**
   * Find tenancy by ID
   */
  async findById(id) {
    const tenancy = await Tenancy.findByPk(id, { include: FULL_INCLUDE });
    if (!tenancy) return null;
    return flattenTenancy(tenancy.get({ plain: true }));
  },

  /**
   * Find all tenancies with pagination
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.unitId) where.unit_id = filters.unitId;
    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.isActive !== undefined) where.is_active = filters.isActive ? true : false;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const unitInclude = {
      model: Unit,
      as: 'unit',
      attributes: ['unit_number', 'building_id'],
      include: [{
        model: Building,
        as: 'building',
        attributes: ['name_en', 'name_ar', 'owner_id', 'address', 'map_embed'],
        where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
        required: Object.keys(buildingWhere).length > 0,
      }],
    };

    if (filters.buildingId) {
      unitInclude.where = { building_id: filters.buildingId };
      unitInclude.required = true;
    }

    const rows = await Tenancy.findAll({
      where,
      include: [
        unitInclude,
        { model: User, as: 'tenant', attributes: ['email', 'first_name', 'last_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return rows.map(t => flattenTenancy(t.get({ plain: true })));
  },

  /**
   * Count total tenancies
   */
  async count(filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.unitId) where.unit_id = filters.unitId;
    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.isActive !== undefined) where.is_active = filters.isActive;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const includes = [];
    const unitInclude = {
      model: Unit,
      as: 'unit',
      attributes: [],
      include: [],
    };

    if (Object.keys(buildingWhere).length) {
      unitInclude.include.push({
        model: Building,
        as: 'building',
        attributes: [],
        where: buildingWhere,
        required: true,
      });
      unitInclude.required = true;
    }

    if (filters.buildingId) {
      unitInclude.where = { building_id: filters.buildingId };
      unitInclude.required = true;
    }

    if (unitInclude.required || unitInclude.where) {
      includes.push(unitInclude);
    }

    return Tenancy.count({ where, include: includes });
  },

  /**
   * Create new tenancy
   */
  async create(tenancyData) {
    const { unitId, tenantId, startDate, endDate, monthlyRent, depositAmount } = tenancyData;

    const tenancy = await Tenancy.create({
      unit_id: unitId,
      tenant_id: tenantId,
      start_date: startDate,
      end_date: endDate,
      monthly_rent: monthlyRent,
      deposit_amount: depositAmount,
      is_active: true,
    });

    return tenancy.id;
  },

  /**
   * Update tenancy
   */
  async update(id, tenancyData) {
    const updateData = {};

    if (tenancyData.endDate) updateData.end_date = tenancyData.endDate;
    if (tenancyData.monthlyRent !== undefined) updateData.monthly_rent = tenancyData.monthlyRent;
    if (tenancyData.depositAmount !== undefined) updateData.deposit_amount = tenancyData.depositAmount;
    if (tenancyData.isActive !== undefined) updateData.is_active = tenancyData.isActive;

    const [affectedCount] = await Tenancy.update(updateData, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * End tenancy
   */
  async endTenancy(id) {
    const [affectedCount] = await Tenancy.update({ is_active: false }, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Find active tenancy for unit
   */
  async findActiveByUnitId(unitId) {
    const tenancy = await Tenancy.findOne({ where: { unit_id: unitId, is_active: true } });
    return tenancy ? tenancy.get({ plain: true }) : null;
  },

  /**
   * Delete tenancy
   */
  async delete(id) {
    const affectedCount = await Tenancy.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Find tenancies by tenant ID
   */
  async findByTenantId(tenantId) {
    const rows = await Tenancy.findAll({
      where: { tenant_id: tenantId },
      include: [{
        model: Unit,
        as: 'unit',
        attributes: ['unit_number', 'building_id'],
        include: [{
          model: Building,
          as: 'building',
          attributes: ['name_en', 'name_ar', 'address'],
        }],
      }],
      order: [['created_at', 'DESC']],
    });

    return rows.map(t => {
      const plain = t.get({ plain: true });
      plain.unit_number = plain.unit?.unit_number || null;
      plain.building_id = plain.unit?.building_id || null;
      plain.building_name = plain.unit?.building?.name_en || null;
      plain.building_name_en = plain.unit?.building?.name_en || null;
      plain.building_name_ar = plain.unit?.building?.name_ar || null;
      plain.building_address = plain.unit?.building?.address || null;
      delete plain.unit;
      return plain;
    });
  },
};

module.exports = tenancyRepository;
