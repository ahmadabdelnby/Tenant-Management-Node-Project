const { pool } = require('../config/database');
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
          
          await pool.execute(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              req.user.id,
              action,
              entityType,
              entityId,
              JSON.stringify(req.originalBody || null),
              JSON.stringify(req.body || null),
              req.ip || req.connection.remoteAddress,
            ]
          );
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
