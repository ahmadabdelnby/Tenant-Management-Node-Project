const { pool } = require('../../config/database');

/**
 * Notification Repository - Database operations
 */
const notificationRepository = {
  /**
   * Find notification by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find notifications for a user
   */
  async findByUserId(userId, limit = 20, offset = 0) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
      [userId]
    );
    return rows;
  },

  /**
   * Count notifications for a user
   */
  async countByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );
    return rows[0].total;
  },

  /**
   * Count unread notifications for a user
   */
  async countUnread(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = false',
      [userId]
    );
    return rows[0].total;
  },

  /**
   * Create notification
   */
  async create(data) {
    const { userId, title, message, type, link, metadata } = data;
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, type, link, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, title, message, type || 'GENERAL', link || null, metadata ? JSON.stringify(metadata) : null]
    );
    return result.insertId;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false',
      [userId]
    );
    return result.affectedRows;
  },

  /**
   * Delete notification
   */
  async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete old notifications (older than 30 days)
   */
  async deleteOld(days = 30) {
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)',
      [days]
    );
    return result.affectedRows;
  },
};

module.exports = notificationRepository;
