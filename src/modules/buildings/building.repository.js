const { Building, User, Unit } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

const OWNER_INCLUDE = {
  model: User,
  as: 'owner',
  attributes: ['email', 'first_name', 'last_name'],
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
      include: [OWNER_INCLUDE],
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
    if (filters.city) {
      where.city = { [Op.like]: `%${filters.city}%` };
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { name_en: { [Op.like]: searchTerm } },
        { name_ar: { [Op.like]: searchTerm } },
        { address: { [Op.like]: searchTerm } },
        { city: { [Op.like]: searchTerm } },
      ];
    }

    const rows = await Building.findAll({
      where,
      include: [OWNER_INCLUDE],
      attributes: {
        include: [
          [literal('(SELECT COUNT(*) FROM units WHERE units.building_id = Building.id AND units.deleted_at IS NULL)'), 'total_units'],
        ],
      },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return rows.map(b => {
      const plain = b.get({ plain: true });
      plain.owner_email = plain.owner?.email || null;
      plain.owner_first_name = plain.owner?.first_name || null;
      plain.owner_last_name = plain.owner?.last_name || null;
      delete plain.owner;
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
    if (filters.city) {
      where.city = { [Op.like]: `%${filters.city}%` };
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { name_en: { [Op.like]: searchTerm } },
        { name_ar: { [Op.like]: searchTerm } },
        { address: { [Op.like]: searchTerm } },
        { city: { [Op.like]: searchTerm } },
      ];
    }

    return Building.count({ where });
  },

  /**
   * Create new building
   */
  async create(buildingData) {
    const { nameEn, nameAr, address, city, postalCode, country, mapEmbed, ownerId, latitude, longitude, descriptionEn, descriptionAr } = buildingData;

    const building = await Building.create({
      name_en: nameEn,
      name_ar: nameAr,
      address,
      city,
      postal_code: postalCode || null,
      country,
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
    if (buildingData.address) updateData.address = buildingData.address;
    if (buildingData.city) updateData.city = buildingData.city;
    if (buildingData.postalCode !== undefined) updateData.postal_code = buildingData.postalCode || null;
    if (buildingData.country) updateData.country = buildingData.country;
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
