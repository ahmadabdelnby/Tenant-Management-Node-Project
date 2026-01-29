const { pool } = require('../../config/database');

/**
 * Tenancy Repository - Database operations
 */
const tenancyRepository = {
  /**
   * Find tenancy by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT t.*, 
              u.unit_number, u.building_id,
              b.name as building_name, b.owner_id,
              tenant.email as tenant_email, tenant.first_name as tenant_first_name, tenant.last_name as tenant_last_name
       FROM tenancies t
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN users tenant ON t.tenant_id = tenant.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0] || null;
  },
  
  /**
   * Find all tenancies with pagination
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT t.*, 
                        u.unit_number, u.building_id,
                        b.name as building_name, b.owner_id,
                        tenant.email as tenant_email, tenant.first_name as tenant_first_name, tenant.last_name as tenant_last_name
                 FROM tenancies t
                 LEFT JOIN units u ON t.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 LEFT JOIN users tenant ON t.tenant_id = tenant.id
                 WHERE 1=1`;
    const params = [];
    
    // Apply filters
    if (filters.unitId) {
      query += ' AND t.unit_id = ?';
      params.push(filters.unitId);
    }
    
    if (filters.tenantId) {
      query += ' AND t.tenant_id = ?';
      params.push(filters.tenantId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.isActive !== undefined) {
      query += ' AND t.is_active = ?';
      params.push(filters.isActive);
    }
    
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    // Add ordering and pagination
    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  
  /**
   * Count total tenancies
   */
  async count(filters = {}) {
    let query = `SELECT COUNT(*) as total 
                 FROM tenancies t
                 LEFT JOIN units u ON t.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 WHERE 1=1`;
    const params = [];
    
    if (filters.unitId) {
      query += ' AND t.unit_id = ?';
      params.push(filters.unitId);
    }
    
    if (filters.tenantId) {
      query += ' AND t.tenant_id = ?';
      params.push(filters.tenantId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.isActive !== undefined) {
      query += ' AND t.is_active = ?';
      params.push(filters.isActive);
    }
    
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },
  
  /**
   * Create new tenancy
   */
  async create(tenancyData) {
    const { unitId, tenantId, startDate, endDate, monthlyRent, depositAmount } = tenancyData;
    
    const [result] = await pool.execute(
      `INSERT INTO tenancies (unit_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
      [unitId, tenantId, startDate, endDate, monthlyRent, depositAmount]
    );
    
    return result.insertId;
  },
  
  /**
   * Update tenancy
   */
  async update(id, tenancyData) {
    const fields = [];
    const params = [];
    
    if (tenancyData.endDate) {
      fields.push('end_date = ?');
      params.push(tenancyData.endDate);
    }
    if (tenancyData.monthlyRent !== undefined) {
      fields.push('monthly_rent = ?');
      params.push(tenancyData.monthlyRent);
    }
    if (tenancyData.depositAmount !== undefined) {
      fields.push('deposit_amount = ?');
      params.push(tenancyData.depositAmount);
    }
    if (tenancyData.isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(tenancyData.isActive);
    }
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE tenancies SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },
  
  /**
   * End tenancy
   */
  async endTenancy(id) {
    const [result] = await pool.execute(
      'UPDATE tenancies SET is_active = false, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Find active tenancy for unit
   */
  async findActiveByUnitId(unitId) {
    const [rows] = await pool.execute(
      `SELECT * FROM tenancies WHERE unit_id = ? AND is_active = true`,
      [unitId]
    );
    return rows[0] || null;
  },
  
  /**
   * Find tenancies by tenant ID
   */
  async findByTenantId(tenantId) {
    const [rows] = await pool.execute(
      `SELECT t.*, 
              u.unit_number, u.building_id,
              b.name as building_name, b.address as building_address
       FROM tenancies t
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       WHERE t.tenant_id = ?
       ORDER BY t.created_at DESC`,
      [tenantId]
    );
    return rows;
  },
};

module.exports = tenancyRepository;
