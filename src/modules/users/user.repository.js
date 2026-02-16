const { User } = require('../../models');
const { Op } = require('sequelize');

const USER_ATTRIBUTES = ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'created_at', 'updated_at'];

/**
 * User Repository - Database operations (Sequelize)
 */
const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id) {
    const user = await User.findByPk(id, { attributes: USER_ATTRIBUTES });
    return user ? user.get({ plain: true }) : null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
      attributes: USER_ATTRIBUTES,
    });
    return user ? user.get({ plain: true }) : null;
  },

  /**
   * Find all users with pagination
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive ? true : false;
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { email: { [Op.like]: searchTerm } },
        { first_name: { [Op.like]: searchTerm } },
        { last_name: { [Op.like]: searchTerm } },
      ];
    }

    const rows = await User.findAll({
      where,
      attributes: USER_ATTRIBUTES,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    return rows.map(r => r.get({ plain: true }));
  },

  /**
   * Count total users
   */
  async count(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive ? true : false;
    }
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      where[Op.or] = [
        { email: { [Op.like]: searchTerm } },
        { first_name: { [Op.like]: searchTerm } },
        { last_name: { [Op.like]: searchTerm } },
      ];
    }

    return User.count({ where });
  },

  /**
   * Create new user
   */
  async create(userData) {
    const { email, passwordHash, firstName, lastName, role, phone } = userData;

    const user = await User.create({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role,
      is_active: true,
    });

    return user.id;
  },

  /**
   * Update user
   */
  async update(id, userData) {
    const updateData = {};

    if (userData.email) updateData.email = userData.email.toLowerCase();
    if (userData.firstName) updateData.first_name = userData.firstName;
    if (userData.lastName) updateData.last_name = userData.lastName;
    if (userData.phone !== undefined) updateData.phone = userData.phone || null;
    if (userData.role) updateData.role = userData.role;
    if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
    if (userData.passwordHash) updateData.password_hash = userData.passwordHash;

    const [affectedCount] = await User.update(updateData, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Soft delete user (paranoid handles deleted_at automatically)
   */
  async softDelete(id) {
    const affectedCount = await User.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Deactivate user
   */
  async deactivate(id) {
    const [affectedCount] = await User.update({ is_active: false }, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Activate user
   */
  async activate(id) {
    const [affectedCount] = await User.update({ is_active: true }, { where: { id } });
    return affectedCount > 0;
  },
};

module.exports = userRepository;
