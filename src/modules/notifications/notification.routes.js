const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate, isAuthenticated, validate } = require('../../middleware');
const {
  notificationIdParamSchema,
  getNotificationsQuerySchema,
} = require('./notification.validation');

/**
 * All notification routes require authentication
 */

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Authenticated
 */
router.get('/unread-count', authenticate, isAuthenticated, notificationController.getUnreadCount);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Authenticated
 */
router.patch('/read-all', authenticate, isAuthenticated, notificationController.markAllAsRead);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Authenticated
 */
router.get('/', authenticate, isAuthenticated, validate(getNotificationsQuerySchema, 'query'), notificationController.getAll);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark single notification as read
 * @access  Authenticated
 */
router.patch('/:id/read', authenticate, isAuthenticated, validate(notificationIdParamSchema, 'params'), notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Authenticated
 */
router.delete('/:id', authenticate, isAuthenticated, validate(notificationIdParamSchema, 'params'), notificationController.delete);

module.exports = router;
