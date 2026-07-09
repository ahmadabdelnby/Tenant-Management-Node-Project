const { Tenancy, Unit, Building, User } = require('../../models');
const { Op } = require('sequelize');

const FULL_INCLUDE = [
  {
    model: Unit,
    as: 'unit',
    attributes: ['unit_number', 'building_id', 'floor'],
    include: [{
      model: Building,
      as: 'building',
      attributes: ['name_en', 'name_ar', 'owner_id', 'map_embed', 'area', 'block', 'avenue', 'street', 'building_number'],
    }],
  },
  {
    model: User,
    as: 'tenant',
    attributes: ['email', 'first_name', 'last_name', 'phone'],
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
  plain.building_map_embed = plain.unit?.building?.map_embed || null;
  plain.building_area = plain.unit?.building?.area || null;
  plain.building_block = plain.unit?.building?.block || null;
  plain.building_avenue = plain.unit?.building?.avenue || null;
  plain.building_street = plain.unit?.building?.street || null;
  plain.building_number = plain.unit?.building?.building_number || null;
  plain.unit_floor = plain.unit?.floor || null;
  plain.owner_id = plain.unit?.building?.owner_id || null;
  plain.tenant_email = plain.tenant?.email || null;
  plain.tenant_first_name = plain.tenant?.first_name || null;
  plain.tenant_last_name = plain.tenant?.last_name || null;
  plain.tenant_phone = plain.tenant?.phone || null;
  plain.contract_number = plain.contract_number || null;
  plain.contract_place = plain.contract_place || null;
  plain.contract_date = plain.contract_date || null;
  plain.first_party_name = plain.first_party_name || null;
  plain.first_party_id = plain.first_party_id || null;
  plain.first_party_nationality = plain.first_party_nationality || null;
  plain.first_party_phone = plain.first_party_phone || null;
  plain.first_party_address = plain.first_party_address || null;
  plain.second_party_name = plain.second_party_name || null;
  plain.second_party_id = plain.second_party_id || null;
  plain.second_party_representative_name = plain.second_party_representative_name || null;
  plain.second_party_representative_civil_id = plain.second_party_representative_civil_id || null;
  plain.second_party_representative_nationality = plain.second_party_representative_nationality || null;
  plain.second_party_representative_phone = plain.second_party_representative_phone || null;
  plain.second_party_representative_address = plain.second_party_representative_address || null;
  plain.second_party_nationality = plain.second_party_nationality || null;
  plain.second_party_phone = plain.second_party_phone || null;
  plain.second_party_address = plain.second_party_address || null;
  plain.contract_duration = plain.contract_duration || null;
  plain.contract_notes = plain.contract_notes || null;
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
      attributes: ['unit_number', 'building_id', 'floor'],
      include: [{
        model: Building,
        as: 'building',
        attributes: ['name_en', 'name_ar', 'owner_id', 'map_embed', 'area', 'block', 'avenue', 'street', 'building_number'],
        where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
        required: Object.keys(buildingWhere).length > 0,
      }],
    };

    if (filters.buildingId) {
      unitInclude.where = { building_id: filters.buildingId };
      unitInclude.required = true;
    }

    const queryOptions = {
      where,
      include: [
        unitInclude,
        { model: User, as: 'tenant', attributes: ['email', 'first_name', 'last_name', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    };
    if (limit) {
      queryOptions.limit = parseInt(limit);
      queryOptions.offset = parseInt(offset);
    }

    const rows = await Tenancy.findAll(queryOptions);

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
      contract_number: tenancyData.contractNumber || null,
      contract_place: tenancyData.contractPlace || null,
      contract_date: tenancyData.contractDate || null,
      first_party_name: tenancyData.firstPartyName || null,
      first_party_id: tenancyData.firstPartyId || null,
      first_party_nationality: tenancyData.firstPartyNationality || null,
      first_party_phone: tenancyData.firstPartyPhone || null,
      first_party_address: tenancyData.firstPartyAddress || null,
      second_party_name: tenancyData.secondPartyName || null,
      second_party_id: tenancyData.secondPartyId || null,
      second_party_representative_name: tenancyData.secondPartyRepresentativeName || null,
      second_party_representative_civil_id: tenancyData.secondPartyRepresentativeCivilId || null,
      second_party_representative_nationality: tenancyData.secondPartyRepresentativeNationality || null,
      second_party_representative_phone: tenancyData.secondPartyRepresentativePhone || null,
      second_party_representative_address: tenancyData.secondPartyRepresentativeAddress || null,
      second_party_nationality: tenancyData.secondPartyNationality || null,
      second_party_phone: tenancyData.secondPartyPhone || null,
      second_party_address: tenancyData.secondPartyAddress || null,
      contract_duration: tenancyData.contractDuration || null,
      contract_notes: tenancyData.contractNotes || null,
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
    if (tenancyData.contractNumber !== undefined) updateData.contract_number = tenancyData.contractNumber || null;
    if (tenancyData.contractPlace !== undefined) updateData.contract_place = tenancyData.contractPlace || null;
    if (tenancyData.contractDate !== undefined) updateData.contract_date = tenancyData.contractDate || null;
    if (tenancyData.firstPartyName !== undefined) updateData.first_party_name = tenancyData.firstPartyName || null;
    if (tenancyData.firstPartyId !== undefined) updateData.first_party_id = tenancyData.firstPartyId || null;
    if (tenancyData.firstPartyNationality !== undefined) updateData.first_party_nationality = tenancyData.firstPartyNationality || null;
    if (tenancyData.firstPartyPhone !== undefined) updateData.first_party_phone = tenancyData.firstPartyPhone || null;
    if (tenancyData.firstPartyAddress !== undefined) updateData.first_party_address = tenancyData.firstPartyAddress || null;
    if (tenancyData.secondPartyName !== undefined) updateData.second_party_name = tenancyData.secondPartyName || null;
    if (tenancyData.secondPartyId !== undefined) updateData.second_party_id = tenancyData.secondPartyId || null;
    if (tenancyData.secondPartyRepresentativeName !== undefined) updateData.second_party_representative_name = tenancyData.secondPartyRepresentativeName || null;
    if (tenancyData.secondPartyRepresentativeCivilId !== undefined) updateData.second_party_representative_civil_id = tenancyData.secondPartyRepresentativeCivilId || null;
    if (tenancyData.secondPartyRepresentativeNationality !== undefined) updateData.second_party_representative_nationality = tenancyData.secondPartyRepresentativeNationality || null;
    if (tenancyData.secondPartyRepresentativePhone !== undefined) updateData.second_party_representative_phone = tenancyData.secondPartyRepresentativePhone || null;
    if (tenancyData.secondPartyRepresentativeAddress !== undefined) updateData.second_party_representative_address = tenancyData.secondPartyRepresentativeAddress || null;
    if (tenancyData.secondPartyNationality !== undefined) updateData.second_party_nationality = tenancyData.secondPartyNationality || null;
    if (tenancyData.secondPartyPhone !== undefined) updateData.second_party_phone = tenancyData.secondPartyPhone || null;
    if (tenancyData.secondPartyAddress !== undefined) updateData.second_party_address = tenancyData.secondPartyAddress || null;
    if (tenancyData.contractDuration !== undefined) updateData.contract_duration = tenancyData.contractDuration || null;
    if (tenancyData.contractNotes !== undefined) updateData.contract_notes = tenancyData.contractNotes || null;

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
          attributes: ['name_en', 'name_ar'],
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
      plain.tenant_phone = plain.tenant?.phone || null;
      plain.building_area = plain.unit?.building?.area || null;
      plain.building_block = plain.unit?.building?.block || null;
      plain.building_avenue = plain.unit?.building?.avenue || null;
      plain.building_street = plain.unit?.building?.street || null;
      plain.building_number = plain.unit?.building?.building_number || null;
      plain.unit_floor = plain.unit?.floor || null;
      plain.contract_number = plain.contract_number || null;
      plain.contract_place = plain.contract_place || null;
      plain.contract_date = plain.contract_date || null;
      plain.first_party_name = plain.first_party_name || null;
      plain.first_party_id = plain.first_party_id || null;
      plain.first_party_nationality = plain.first_party_nationality || null;
      plain.first_party_phone = plain.first_party_phone || null;
      plain.first_party_address = plain.first_party_address || null;
      plain.second_party_name = plain.second_party_name || null;
      plain.second_party_id = plain.second_party_id || null;
      plain.second_party_representative_name = plain.second_party_representative_name || null;
      plain.second_party_representative_civil_id = plain.second_party_representative_civil_id || null;
      plain.second_party_representative_nationality = plain.second_party_representative_nationality || null;
      plain.second_party_representative_phone = plain.second_party_representative_phone || null;
      plain.second_party_representative_address = plain.second_party_representative_address || null;
      plain.second_party_nationality = plain.second_party_nationality || null;
      plain.second_party_phone = plain.second_party_phone || null;
      plain.second_party_address = plain.second_party_address || null;
      plain.contract_duration = plain.contract_duration || null;
      plain.contract_notes = plain.contract_notes || null;
      delete plain.unit;
      return plain;
    });
  },
};

module.exports = tenancyRepository;
