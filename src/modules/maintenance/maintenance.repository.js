const { MaintenanceRequest, Unit, Building, User, Tenancy } = require('../../models');
const { Op } = require('sequelize');

const FIND_INCLUDE = [
  {
    model: Unit,
    as: 'unit',
    attributes: ['unit_number', 'building_id'],
    include: [{
      model: Building,
      as: 'building',
      attributes: ['name_en', 'name_ar', 'owner_id'],
    }],
  },
  {
    model: User,
    as: 'tenant',
    attributes: ['email', 'first_name', 'last_name'],
  },
];

const FIND_BY_ID_INCLUDE = [
  ...FIND_INCLUDE,
  {
    model: User,
    as: 'resolver',
    attributes: ['first_name', 'last_name'],
  },
];

/**
 * Flatten nested includes for backward compatibility
 */
function flattenMR(plain, includeResolver = false) {
  plain.unit_number = plain.unit?.unit_number || null;
  plain.building_id = plain.unit?.building_id || null;
  plain.building_name = plain.unit?.building?.name_en || null;
  plain.building_name_en = plain.unit?.building?.name_en || null;
  plain.building_name_ar = plain.unit?.building?.name_ar || null;
  plain.owner_id = plain.unit?.building?.owner_id || null;
  plain.tenant_email = plain.tenant?.email || null;
  plain.tenant_first_name = plain.tenant?.first_name || null;
  plain.tenant_last_name = plain.tenant?.last_name || null;
  if (includeResolver) {
    plain.resolver_first_name = plain.resolver?.first_name || null;
    plain.resolver_last_name = plain.resolver?.last_name || null;
    delete plain.resolver;
  }
  delete plain.unit;
  delete plain.tenant;
  return plain;
}

/**
 * Maintenance Request Repository - Database operations (Sequelize)
 */
const maintenanceRepository = {
  /**
   * Find maintenance request by ID
   */
  async findById(id) {
    const mr = await MaintenanceRequest.findByPk(id, { include: FIND_BY_ID_INCLUDE });
    if (!mr) return null;
    return flattenMR(mr.get({ plain: true }), true);
  },

  /**
   * Find all maintenance requests with pagination
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.unitId) where.unit_id = filters.unitId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const unitInclude = {
      model: Unit,
      as: 'unit',
      attributes: ['unit_number', 'building_id'],
      include: [{
        model: Building,
        as: 'building',
        attributes: ['name_en', 'name_ar', 'owner_id'],
        where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
        required: Object.keys(buildingWhere).length > 0,
      }],
    };

    if (filters.buildingId) {
      unitInclude.where = { building_id: filters.buildingId };
      unitInclude.required = true;
    }

    const rows = await MaintenanceRequest.findAll({
      where,
      include: [
        unitInclude,
        { model: User, as: 'tenant', attributes: ['email', 'first_name', 'last_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    return rows.map(r => flattenMR(r.get({ plain: true })));
  },

  /**
   * Count total maintenance requests
   */
  async count(filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.unitId) where.unit_id = filters.unitId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;

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

    return MaintenanceRequest.count({ where, include: includes });
  },

  /**
   * Create new maintenance request
   */
  async create(requestData) {
    const { tenantId, unitId, title, description, category, priority } = requestData;

    const mr = await MaintenanceRequest.create({
      tenant_id: tenantId,
      unit_id: unitId,
      title,
      description,
      category: category || 'OTHER',
      priority: priority || 'MEDIUM',
      status: 'PENDING',
    });

    return mr.id;
  },

  /**
   * Update maintenance request
   */
  async update(id, requestData) {
    const updateData = {};

    if (requestData.title !== undefined) updateData.title = requestData.title;
    if (requestData.description !== undefined) updateData.description = requestData.description;
    if (requestData.category !== undefined) updateData.category = requestData.category;
    if (requestData.priority !== undefined) updateData.priority = requestData.priority;
    if (requestData.status !== undefined) updateData.status = requestData.status;
    if (requestData.resolutionNotes !== undefined) updateData.resolution_notes = requestData.resolutionNotes;
    if (requestData.resolvedBy !== undefined) updateData.resolved_by = requestData.resolvedBy;
    if (requestData.resolvedAt !== undefined) updateData.resolved_at = requestData.resolvedAt;

    if (Object.keys(updateData).length === 0) return;

    await MaintenanceRequest.update(updateData, { where: { id } });
  },

  /**
   * Delete maintenance request
   */
  async delete(id) {
    await MaintenanceRequest.destroy({ where: { id } });
  },

  /**
   * Get tenant's active tenancy unit (first one)
   */
  async getTenantUnit(tenantId) {
    const tenancy = await Tenancy.findOne({
      where: { tenant_id: tenantId, is_active: true },
      include: [{
        model: Unit,
        as: 'unit',
        attributes: ['unit_number'],
        include: [{
          model: Building,
          as: 'building',
          attributes: ['name_en', 'name_ar'],
        }],
      }],
    });
    if (!tenancy) return null;
    const plain = tenancy.get({ plain: true });
    return {
      unit_id: plain.unit_id,
      unit_number: plain.unit?.unit_number || null,
      building_name: plain.unit?.building?.name_en || null,
      building_name_en: plain.unit?.building?.name_en || null,
      building_name_ar: plain.unit?.building?.name_ar || null,
    };
  },

  /**
   * Get ALL tenant's active tenancy units
   */
  async getTenantUnits(tenantId) {
    const rows = await Tenancy.findAll({
      where: { tenant_id: tenantId, is_active: true },
      include: [{
        model: Unit,
        as: 'unit',
        attributes: ['unit_number', 'floor', 'bedrooms', 'bathrooms'],
        include: [{
          model: Building,
          as: 'building',
          attributes: ['id', 'name_en', 'name_ar', 'address'],
        }],
      }],
      order: [[{ model: Unit, as: 'unit' }, { model: Building, as: 'building' }, 'name_en', 'ASC']],
    });

    return rows.map(t => {
      const plain = t.get({ plain: true });
      return {
        unit_id: plain.unit_id,
        tenancy_id: plain.id,
        unit_number: plain.unit?.unit_number || null,
        floor: plain.unit?.floor || null,
        bedrooms: plain.unit?.bedrooms || null,
        bathrooms: plain.unit?.bathrooms || null,
        building_id: plain.unit?.building?.id || null,
        building_name: plain.unit?.building?.name_en || null,
        building_name_en: plain.unit?.building?.name_en || null,
        building_name_ar: plain.unit?.building?.name_ar || null,
        building_address: plain.unit?.building?.address || null,
      };
    });
  },

  /**
   * Verify tenant has access to a specific unit
   */
  async verifyTenantUnit(tenantId, unitId) {
    const count = await Tenancy.count({
      where: { tenant_id: tenantId, unit_id: unitId, is_active: true },
    });
    return count > 0;
  },

  /**
   * Find all maintenance requests for export (no pagination)
   */
  async findAllForExport(filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    if (filters.dateFrom) {
      where.created_at = { ...(where.created_at || {}), [Op.gte]: filters.dateFrom };
    }
    if (filters.dateTo) {
      where.created_at = { ...(where.created_at || {}), [Op.lte]: filters.dateTo };
    }

    const unitInclude = {
      model: Unit,
      as: 'unit',
      attributes: ['unit_number', 'building_id'],
      include: [{
        model: Building,
        as: 'building',
        attributes: ['name_en', 'name_ar', 'owner_id'],
        where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
        required: Object.keys(buildingWhere).length > 0,
      }],
    };

    if (filters.buildingId) {
      unitInclude.where = { building_id: filters.buildingId };
      unitInclude.required = true;
    }

    const rows = await MaintenanceRequest.findAll({
      where,
      include: [
        unitInclude,
        {
          model: User,
          as: 'tenant',
          attributes: ['email', 'first_name', 'last_name', 'phone'],
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['first_name', 'last_name'],
        },
      ],
      order: [
        [{ model: Unit, as: 'unit' }, { model: Building, as: 'building' }, 'name_en', 'ASC'],
        [{ model: Unit, as: 'unit' }, 'unit_number', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });

    return rows.map(r => {
      const plain = r.get({ plain: true });
      plain.unit_number = plain.unit?.unit_number || null;
      plain.building_id = plain.unit?.building_id || null;
      plain.building_name = plain.unit?.building?.name_en || null;
      plain.building_name_en = plain.unit?.building?.name_en || null;
      plain.building_name_ar = plain.unit?.building?.name_ar || null;
      plain.owner_id = plain.unit?.building?.owner_id || null;
      plain.tenant_email = plain.tenant?.email || null;
      plain.tenant_first_name = plain.tenant?.first_name || null;
      plain.tenant_last_name = plain.tenant?.last_name || null;
      plain.tenant_phone = plain.tenant?.phone || null;
      plain.resolver_first_name = plain.resolver?.first_name || null;
      plain.resolver_last_name = plain.resolver?.last_name || null;
      delete plain.unit;
      delete plain.tenant;
      delete plain.resolver;
      return plain;
    });
  },
};

module.exports = maintenanceRepository;
