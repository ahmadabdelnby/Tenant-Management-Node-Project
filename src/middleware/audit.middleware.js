const { AuditLog } = require('../models');
const logger = require('../shared/utils/logger');

/**
 * Audit Logging Middleware
 * Logs user actions for audit trail
 */
const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json function
    const originalJson = res.json.bind(res);
    
    res.json = async function (data) {
      // Only log successful operations
      if (data.success && req.user) {
        try {
          const entityId = req.params.id || data.data?.id || null;
          
          await AuditLog.create({
            user_id: req.user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_values: req.originalBody || null,
            new_values: req.body || null,
            ip_address: req.ip || req.connection.remoteAddress,
          });
        } catch (error) {
          // Don't fail the request if audit logging fails
          logger.error('Audit logging failed:', error);
        }
      }
      
      return originalJson(data);
    };
    
    // Store original body for comparison
    req.originalBody = { ...req.body };
    
    next();
  };
};

module.exports = auditLog;
