const notificationRepository = require('./notification.repository');
const { NotFoundError, AuthorizationError } = require('../../shared/errors');
const { ERROR_MESSAGES } = require('../../shared/constants');
const logger = require('../../shared/utils/logger');

/**
 * Notification Service - Business logic
 */
const notificationService = {
  /**
   * Format notification
   */
  formatNotification(notification) {
    return {
      id: notification.id,
      userId: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read === 1 || notification.is_read === true,
      link: notification.link,
      metadata: notification.metadata ? (typeof notification.metadata === 'string' ? JSON.parse(notification.metadata) : notification.metadata) : null,
      createdAt: notification.created_at,
    };
  },

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      notificationRepository.findByUserId(userId, limit, offset),
      notificationRepository.countByUserId(userId),
      notificationRepository.countUnread(userId),
    ]);

    return {
      notifications: notifications.map(n => this.formatNotification(n)),
      unreadCount,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    return notificationRepository.countUnread(userId);
  },

  /**
   * Create a notification
   */
  async createNotification(data) {
    const id = await notificationRepository.create(data);
    logger.info(`Notification created: ID ${id} for user ${data.userId}`);
    return id;
  },

  /**
   * Send payment link notification to tenant
   */
  async sendPaymentLinkNotification(tenantId, paymentLink, paymentDetails) {
    const { unitNumber, buildingName, month, year, amount } = paymentDetails;
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return this.createNotification({
      userId: tenantId,
      title: 'Payment Link Available',
      message: `A payment link has been created for your rent of ${amount} KWD for ${monthNames[month]} ${year} (Unit ${unitNumber}, ${buildingName}). Click to pay.`,
      type: 'PAYMENT_LINK',
      link: paymentLink,
      metadata: { month, year, amount, unitNumber, buildingName },
    });
  },

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminder(tenantId, paymentDetails) {
    const { unitNumber, buildingName, month, year, amount } = paymentDetails;
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return this.createNotification({
      userId: tenantId,
      title: 'Rent Payment Reminder',
      message: `Your rent of ${amount} KWD for ${monthNames[month]} ${year} (Unit ${unitNumber}, ${buildingName}) is due. Please make your payment.`,
      type: 'PAYMENT_REMINDER',
      link: '/payments',
      metadata: { month, year, amount, unitNumber, buildingName },
    });
  },

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(tenantId, paymentDetails) {
    const { unitNumber, buildingName, month, year, amount } = paymentDetails;
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return this.createNotification({
      userId: tenantId,
      title: 'Payment Confirmed',
      message: `Your rent payment of ${amount} KWD for ${monthNames[month]} ${year} (Unit ${unitNumber}, ${buildingName}) has been confirmed. Thank you!`,
      type: 'PAYMENT',
      link: '/payments',
      metadata: { month, year, amount, unitNumber, buildingName },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    if (notification.user_id !== userId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    await notificationRepository.markAsRead(notificationId);
    return { message: 'Notification marked as read' };
  },

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    const count = await notificationRepository.markAllAsRead(userId);
    return { message: `${count} notifications marked as read` };
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    if (notification.user_id !== userId) {
      throw new AuthorizationError(ERROR_MESSAGES.FORBIDDEN);
    }

    await notificationRepository.delete(notificationId);
    return { message: 'Notification deleted' };
  },
};

module.exports = notificationService;
