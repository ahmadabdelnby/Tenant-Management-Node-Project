/**
 * Error Messages Constants
 */
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Authentication token is required',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_BLACKLISTED: 'Token has been invalidated',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
  
  // Authorization
  ACCESS_DENIED: 'Access denied. Insufficient permissions',
  FORBIDDEN: 'You do not have permission to perform this action',
  
  // Users
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  EMAIL_REQUIRED: 'Email is required',
  INVALID_EMAIL: 'Invalid email format',
  CANNOT_DELETE_SELF: 'You cannot delete your own account',
  CANNOT_DEACTIVATE_SELF: 'You cannot deactivate your own account',
  
  // Buildings
  BUILDING_NOT_FOUND: 'Building not found',
  BUILDING_HAS_UNITS: 'Cannot delete building with existing units',
  
  // Units
  UNIT_NOT_FOUND: 'Unit not found',
  UNIT_HAS_ACTIVE_TENANCY: 'Cannot delete unit with active tenancy',
  UNIT_NOT_AVAILABLE: 'Unit is not available for rent',
  
  // Tenancies
  TENANCY_NOT_FOUND: 'Tenancy not found',
  TENANCY_ALREADY_ACTIVE: 'Unit already has an active tenancy',
  TENANCY_ALREADY_ENDED: 'Tenancy has already ended',
  INVALID_TENANCY_DATES: 'End date must be after start date',
  
  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_INPUT: 'Invalid input data',
  
  // Rate Limiting
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many login attempts. Please try again in 15 minutes',
  
  // Server
  INTERNAL_ERROR: 'An internal server error occurred',
  DATABASE_ERROR: 'Database operation failed',
};

module.exports = ERROR_MESSAGES;
