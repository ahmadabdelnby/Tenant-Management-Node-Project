const maintenanceRoutes = require('./maintenance.routes');
const maintenanceController = require('./maintenance.controller');
const maintenanceService = require('./maintenance.service');
const maintenanceRepository = require('./maintenance.repository');

module.exports = {
  maintenanceRoutes,
  maintenanceController,
  maintenanceService,
  maintenanceRepository,
};
