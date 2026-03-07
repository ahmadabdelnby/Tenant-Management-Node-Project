const { Building, User, Unit, City } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

const OWNER_INCLUDE = {
  model: User,
  as: 'owner',
  attributes: ['email', 'first_name', 'last_name'],
};

const CITY_INCLUDE = {
  model: City,
  as: 'city',
  attributes: ['id', 'name_en', 'name_ar'],
};

/**
 * Building Repository - Database operations (Sequelize)
 */
const buildingRepository = {
  /**
   * Find building by ID
   */
  async findById(id) {
    const building = await Building.findByPk(id, {
      include: [OWNER_INCLUDE, CITY_INCLUDE],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM units WHERE units.building_id = Building.id AND units.deleted_at IS NULL)'), 'total_units'],
        ],
      },
    });
    if (!building) return null;
    const plain = building.get({ plain: true });
    // Flatten owner fields for backward compatibility
    plain.owner_email = plain.owner?.email || null;
    plain.owner_first_name = plain.owner?.first_name || null;
    plain.owner_last_name = plain.owner?.last_name || null;
    delete plain.owner;
    // Flatten city fields
    plain.city_name_en = plain.city?.name_en || null;
    plain.city_name_ar = plain.city?.name_ar || null;
    delete plain.city;
    return plain;
  },

  /**
   * Find all buildings with pagination
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};

    if (filters.ownerId) {
      where.owner_id = filters.ownerId;
    }
    if (filters.cityId) {
      where.city_id = filters.cityId;
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { name_en: { [Op.like]: searchTerm } },
        { name_ar: { [Op.like]: searchTerm } },
        { area: { [Op.like]: searchTerm } },
        { street: { [Op.like]: searchTerm } },
        { block: { [Op.like]: searchTerm } },
        { '$city.name_en$': { [Op.like]: searchTerm } },
        { '$city.name_ar$': { [Op.like]: searchTerm } },
      ];
    }

    const queryOptions = {
      where,
      include: [OWNER_INCLUDE, CITY_INCLUDE],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM units WHERE units.building_id = Building.id AND units.deleted_at IS NULL)'), 'total_units'],
        ],
      },
      order: [['created_at', 'DESC']],
      subQuery: false,
    };
    if (limit) {
      queryOptions.limit = parseInt(limit);
      queryOptions.offset = parseInt(offset);
    }

    const rows = await Building.findAll(queryOptions);

    return rows.map(b => {
      const plain = b.get({ plain: true });
      plain.owner_email = plain.owner?.email || null;
      plain.owner_first_name = plain.owner?.first_name || null;
      plain.owner_last_name = plain.owner?.last_name || null;
      delete plain.owner;
      plain.city_name_en = plain.city?.name_en || null;
      plain.city_name_ar = plain.city?.name_ar || null;
      delete plain.city;
      return plain;
    });
  },

  /**
   * Count total buildings
   */
  async count(filters = {}) {
    const where = {};

    if (filters.ownerId) {
      where.owner_id = filters.ownerId;
    }
    if (filters.cityId) {
      where.city_id = filters.cityId;
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { name_en: { [Op.like]: searchTerm } },
        { name_ar: { [Op.like]: searchTerm } },
        { area: { [Op.like]: searchTerm } },
        { street: { [Op.like]: searchTerm } },
        { block: { [Op.like]: searchTerm } },
        { '$city.name_en$': { [Op.like]: searchTerm } },
        { '$city.name_ar$': { [Op.like]: searchTerm } },
      ];
    }

    return Building.count({ where, include: filters.search ? [CITY_INCLUDE] : [] });
  },

  /**
   * Create new building
   */
  async create(buildingData) {
    const { nameEn, nameAr, cityId, area, block, avenue, street, buildingNumber, mapEmbed, ownerId, latitude, longitude, descriptionEn, descriptionAr } = buildingData;

    const building = await Building.create({
      name_en: nameEn,
      name_ar: nameAr,
      city_id: cityId,
      area: area || null,
      block: block || null,
      avenue: avenue || null,
      street: street || null,
      building_number: buildingNumber || null,
      map_embed: mapEmbed || null,
      owner_id: ownerId,
      latitude: latitude || null,
      longitude: longitude || null,
      description_en: descriptionEn || null,
      description_ar: descriptionAr || null,
    });

    return building.id;
  },

  /**
   * Update building
   */
  async update(id, buildingData) {
    const updateData = {};

    if (buildingData.nameEn) updateData.name_en = buildingData.nameEn;
    if (buildingData.nameAr) updateData.name_ar = buildingData.nameAr;
    if (buildingData.cityId) updateData.city_id = buildingData.cityId;
    if (buildingData.area !== undefined) updateData.area = buildingData.area || null;
    if (buildingData.block !== undefined) updateData.block = buildingData.block || null;
    if (buildingData.avenue !== undefined) updateData.avenue = buildingData.avenue || null;
    if (buildingData.street !== undefined) updateData.street = buildingData.street || null;
    if (buildingData.buildingNumber !== undefined) updateData.building_number = buildingData.buildingNumber || null;
    if (buildingData.mapEmbed !== undefined) updateData.map_embed = buildingData.mapEmbed || null;
    if (buildingData.ownerId) updateData.owner_id = buildingData.ownerId;
    if (buildingData.latitude !== undefined) updateData.latitude = buildingData.latitude || null;
    if (buildingData.longitude !== undefined) updateData.longitude = buildingData.longitude || null;
    if (buildingData.descriptionEn !== undefined) updateData.description_en = buildingData.descriptionEn || null;
    if (buildingData.descriptionAr !== undefined) updateData.description_ar = buildingData.descriptionAr || null;

    const [affectedCount] = await Building.update(updateData, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Soft delete building (paranoid handles deleted_at automatically)
   */
  async softDelete(id) {
    const affectedCount = await Building.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Check if building has units
   */
  async hasUnits(id) {
    const count = await Unit.count({ where: { building_id: id } });
    return count > 0;
  },

  /**
   * Get buildings by owner ID
   */
  async findByOwnerId(ownerId) {
    const rows = await Building.findAll({
      where: { owner_id: ownerId },
      order: [['created_at', 'DESC']],
    });
    return rows.map(r => r.get({ plain: true }));
  },
};

module.exports = buildingRepository;
