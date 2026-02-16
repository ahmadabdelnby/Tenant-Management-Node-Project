const paymentRoutes = require('./payment.routes');
const paymentService = require('./payment.service');
const paymentController = require('./payment.controller');
const paymentRepository = require('./payment.repository');
const tahseeelService = require('./tahseeel.service');

module.exports = {
  paymentRoutes,
  paymentService,
  paymentController,
  paymentRepository,
  tahseeelService,
};
