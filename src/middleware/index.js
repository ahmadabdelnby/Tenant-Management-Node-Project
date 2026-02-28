const authenticate = require('./auth.middleware');
const { authorize, isAdmin, isAdminOrOwner, isAuthenticated } = require('./rbac.middleware');
const validate = require('./validation.middleware');
const auditLog = require('./audit.middleware');
const { errorHandler, notFoundHandler } = require('./errorHandler.middleware');
const xssSanitize = require('./xssSanitize.middleware');

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrOwner,
  isAuthenticated,
  validate,
  auditLog,
  errorHandler,
  notFoundHandler,
  xssSanitize,
};
