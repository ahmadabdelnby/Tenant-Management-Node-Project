const authenticate = require('./auth.middleware');
const { authorize, isAdmin, isAdminOrOwner, isAuthenticated } = require('./rbac.middleware');
const { apiLimiter, loginLimiter } = require('./rateLimiter.middleware');
const validate = require('./validation.middleware');
const auditLog = require('./audit.middleware');
const { errorHandler, notFoundHandler } = require('./errorHandler.middleware');

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  isAdminOrOwner,
  isAuthenticated,
  apiLimiter,
  loginLimiter,
  validate,
  auditLog,
  errorHandler,
  notFoundHandler,
};
