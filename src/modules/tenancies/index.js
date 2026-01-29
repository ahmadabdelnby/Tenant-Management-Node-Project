const tenancyRoutes = require('./tenancy.routes');
const myTenanciesRoutes = require('./myTenancies.routes');
const tenancyService = require('./tenancy.service');
const tenancyController = require('./tenancy.controller');
const tenancyRepository = require('./tenancy.repository');

module.exports = {
  tenancyRoutes,
  myTenanciesRoutes,
  tenancyService,
  tenancyController,
  tenancyRepository,
};
