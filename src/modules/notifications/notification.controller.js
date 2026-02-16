const notificationService = require('./notification.service');
const { successResponse } = require('../../shared/utils/responseFormatter');
const { HTTP_STATUS } = require('../../shared/constants');

/**
 * Notification Controller
 */
const notificationController = {
  /**
   * Get current user's notifications
   * GET /api/notifications
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await notificationService.getUserNotifications(req.user.id, page, limit);

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Notifications retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get unread count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);

      res.status(HTTP_STATUS.OK).json(
        successResponse({ unreadCount: count }, 'Unread count retrieved')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark notification as read
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(
        parseInt(req.params.id),
        req.user.id
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Notification marked as read')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'All notifications marked as read')
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete notification
   * DELETE /api/notifications/:id
   */
  async delete(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(
        parseInt(req.params.id),
        req.user.id
      );

      res.status(HTTP_STATUS.OK).json(
        successResponse(result, 'Notification deleted')
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
