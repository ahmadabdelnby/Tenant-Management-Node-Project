const { AuthorizationError } = require('../shared/errors');
const { ERROR_MESSAGES } = require('../shared/constants');

/**
 * Role-Based Access Control Middleware Factory
 * @param {...string} allowedRoles - Roles that are allowed to access
 * @returns {Function} - Middleware function
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError(ERROR_MESSAGES.ACCESS_DENIED));
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError(ERROR_MESSAGES.FORBIDDEN));
    }
    
    next();
  };
};

/**
 * Check if user is Admin
 */
const isAdmin = authorize('ADMIN');

/**
 * Check if user is Admin or Owner
 */
const isAdminOrOwner = authorize('ADMIN', 'OWNER');

/**
 * Check if user is authenticated (any role)
 */
const isAuthenticated = authorize('ADMIN', 'OWNER', 'TENANT');

module.exports = {
  authorize,
  isAdmin,
  isAdminOrOwner,
  isAuthenticated,
};
