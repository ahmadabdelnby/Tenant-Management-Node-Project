const { Notification } = require('../../models');
const { Op } = require('sequelize');

/**
 * Notification Repository - Database operations (Sequelize)
 */
const notificationRepository = {
  /**
   * Find notification by ID
   */
  async findById(id) {
    const notification = await Notification.findByPk(id);
    return notification ? notification.get({ plain: true }) : null;
  },

  /**
   * Find notifications for a user
   */
  async findByUserId(userId, limit = 20, offset = 0) {
    const rows = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    return rows.map(r => r.get({ plain: true }));
  },

  /**
   * Count notifications for a user
   */
  async countByUserId(userId) {
    return Notification.count({ where: { user_id: userId } });
  },

  /**
   * Count unread notifications for a user
   */
  async countUnread(userId) {
    return Notification.count({ where: { user_id: userId, is_read: false } });
  },

  /**
   * Create notification
   */
  async create(data) {
    const { userId, title, message, type, link, metadata } = data;

    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type: type || 'GENERAL',
      link: link || null,
      metadata: metadata || null,
    });

    return notification.id;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    const [affectedCount] = await Notification.update({ is_read: true }, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const [affectedCount] = await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    return affectedCount;
  },

  /**
   * Delete notification
   */
  async delete(id) {
    const affectedCount = await Notification.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Delete old notifications (older than 30 days)
   */
  async deleteOld(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const affectedCount = await Notification.destroy({
      where: { created_at: { [Op.lt]: cutoff } },
    });
    return affectedCount;
  },
};

module.exports = notificationRepository;
