const { pool } = require('../../config/database');

/**
 * Maintenance Request Repository - Database operations
 */
const maintenanceRepository = {
  /**
   * Find maintenance request by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT mr.*, 
              u.unit_number, u.building_id,
              b.name as building_name, b.owner_id,
              tenant.email as tenant_email, tenant.first_name as tenant_first_name, tenant.last_name as tenant_last_name,
              resolver.first_name as resolver_first_name, resolver.last_name as resolver_last_name
       FROM maintenance_requests mr
       LEFT JOIN units u ON mr.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN users tenant ON mr.tenant_id = tenant.id
       LEFT JOIN users resolver ON mr.resolved_by = resolver.id
       WHERE mr.id = ?`,
      [id]
    );
    return rows[0] || null;
  },
  
  /**
   * Find all maintenance requests with pagination
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT mr.*, 
                        u.unit_number, u.building_id,
                        b.name as building_name, b.owner_id,
                        tenant.email as tenant_email, tenant.first_name as tenant_first_name, tenant.last_name as tenant_last_name
                 FROM maintenance_requests mr
                 LEFT JOIN units u ON mr.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 LEFT JOIN users tenant ON mr.tenant_id = tenant.id
                 WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (filters.tenantId) {
      query += ' AND mr.tenant_id = ?';
      params.push(filters.tenantId);
    }
    
    if (filters.unitId) {
      query += ' AND mr.unit_id = ?';
      params.push(filters.unitId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.status) {
      query += ' AND mr.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND mr.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.category) {
      query += ' AND mr.category = ?';
      params.push(filters.category);
    }
    
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    query += ` ORDER BY mr.created_at DESC LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;
    
    const [rows] = await pool.query(query, params);
    return rows;
  },
  
  /**
   * Count total maintenance requests
   */
  async count(filters = {}) {
    let query = `SELECT COUNT(*) as total 
                 FROM maintenance_requests mr
                 LEFT JOIN units u ON mr.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 WHERE 1=1`;
    const params = [];
    
    if (filters.tenantId) {
      query += ' AND mr.tenant_id = ?';
      params.push(filters.tenantId);
    }
    
    if (filters.unitId) {
      query += ' AND mr.unit_id = ?';
      params.push(filters.unitId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.status) {
      query += ' AND mr.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND mr.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.category) {
      query += ' AND mr.category = ?';
      params.push(filters.category);
    }
    
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },
  
  /**
   * Create new maintenance request
   */
  async create(requestData) {
    const { tenantId, unitId, title, description, category, priority } = requestData;
    
    const [result] = await pool.execute(
      `INSERT INTO maintenance_requests (tenant_id, unit_id, title, description, category, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
      [tenantId, unitId, title, description, category || 'OTHER', priority || 'MEDIUM']
    );
    
    return result.insertId;
  },
  
  /**
   * Update maintenance request
   */
  async update(id, requestData) {
    const fields = [];
    const params = [];
    
    if (requestData.title !== undefined) {
      fields.push('title = ?');
      params.push(requestData.title);
    }
    
    if (requestData.description !== undefined) {
      fields.push('description = ?');
      params.push(requestData.description);
    }
    
    if (requestData.category !== undefined) {
      fields.push('category = ?');
      params.push(requestData.category);
    }
    
    if (requestData.priority !== undefined) {
      fields.push('priority = ?');
      params.push(requestData.priority);
    }
    
    if (requestData.status !== undefined) {
      fields.push('status = ?');
      params.push(requestData.status);
    }
    
    if (requestData.resolutionNotes !== undefined) {
      fields.push('resolution_notes = ?');
      params.push(requestData.resolutionNotes);
    }
    
    if (requestData.resolvedBy !== undefined) {
      fields.push('resolved_by = ?');
      params.push(requestData.resolvedBy);
    }
    
    if (requestData.resolvedAt !== undefined) {
      fields.push('resolved_at = ?');
      params.push(requestData.resolvedAt);
    }
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    await pool.execute(
      `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
  },
  
  /**
   * Delete maintenance request
   */
  async delete(id) {
    await pool.execute('DELETE FROM maintenance_requests WHERE id = ?', [id]);
  },
  
  /**
   * Get tenant's active tenancy unit (first one)
   */
  async getTenantUnit(tenantId) {
    const [rows] = await pool.execute(
      `SELECT t.unit_id, u.unit_number, b.name as building_name
       FROM tenancies t
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       WHERE t.tenant_id = ? AND t.is_active = 1
       LIMIT 1`,
      [tenantId]
    );
    return rows[0] || null;
  },
  
  /**
   * Get ALL tenant's active tenancy units
   */
  async getTenantUnits(tenantId) {
    const [rows] = await pool.execute(
      `SELECT t.unit_id, t.id as tenancy_id, u.unit_number, u.floor, u.bedrooms, u.bathrooms,
              b.id as building_id, b.name as building_name, b.address as building_address
       FROM tenancies t
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       WHERE t.tenant_id = ? AND t.is_active = 1
       ORDER BY b.name, u.unit_number`,
      [tenantId]
    );
    return rows;
  },
  
  /**
   * Verify tenant has access to a specific unit
   */
  async verifyTenantUnit(tenantId, unitId) {
    const [rows] = await pool.execute(
      `SELECT t.id 
       FROM tenancies t
       WHERE t.tenant_id = ? AND t.unit_id = ? AND t.is_active = 1`,
      [tenantId, unitId]
    );
    return rows.length > 0;
  },

  /**
   * Find all maintenance requests for export (no pagination)
   */
  async findAllForExport(filters = {}) {
    let query = `SELECT mr.*,
                        u.unit_number, u.building_id,
                        b.name as building_name, b.owner_id,
                        tenant.email as tenant_email, tenant.first_name as tenant_first_name,
                        tenant.last_name as tenant_last_name, tenant.phone as tenant_phone,
                        resolver.first_name as resolver_first_name, resolver.last_name as resolver_last_name
                 FROM maintenance_requests mr
                 LEFT JOIN units u ON mr.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 LEFT JOIN users tenant ON mr.tenant_id = tenant.id
                 LEFT JOIN users resolver ON mr.resolved_by = resolver.id
                 WHERE 1=1`;
    const params = [];

    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    if (filters.tenantId) {
      query += ' AND mr.tenant_id = ?';
      params.push(filters.tenantId);
    }
    if (filters.status) {
      query += ' AND mr.status = ?';
      params.push(filters.status);
    }
    if (filters.priority) {
      query += ' AND mr.priority = ?';
      params.push(filters.priority);
    }
    if (filters.category) {
      query += ' AND mr.category = ?';
      params.push(filters.category);
    }
    if (filters.dateFrom) {
      query += ' AND mr.created_at >= ?';
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      query += ' AND mr.created_at <= ?';
      params.push(filters.dateTo);
    }

    query += ' ORDER BY b.name ASC, u.unit_number ASC, mr.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },
};

module.exports = maintenanceRepository;
