const notificationRoutes = require('./notification.routes');
const notificationService = require('./notification.service');
const notificationController = require('./notification.controller');
const notificationRepository = require('./notification.repository');

module.exports = {
  notificationRoutes,
  notificationService,
  notificationController,
  notificationRepository,
};
