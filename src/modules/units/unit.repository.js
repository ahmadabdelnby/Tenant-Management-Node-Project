const { pool } = require('../../config/database');
const { UNIT_STATUS } = require('../../shared/constants');

/**
 * Unit Repository - Database operations
 */
const unitRepository = {
  /**
   * Find unit by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT u.*, b.name as building_name, b.address as building_address, b.owner_id
       FROM units u
       LEFT JOIN buildings b ON u.building_id = b.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },
  
  /**
   * Find all units with pagination
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT u.*, b.name as building_name, b.address as building_address, b.owner_id
                 FROM units u
                 LEFT JOIN buildings b ON u.building_id = b.id
                 WHERE u.deleted_at IS NULL AND b.deleted_at IS NULL`;
    const params = [];
    
    // Apply filters
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.status) {
      query += ' AND u.status = ?';
      params.push(filters.status);
    }
    
    if (filters.minBedrooms) {
      query += ' AND u.bedrooms >= ?';
      params.push(filters.minBedrooms);
    }
    
    if (filters.maxRent) {
      query += ' AND u.rent_amount <= ?';
      params.push(filters.maxRent);
    }
    
    // Add ordering and pagination
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  
  /**
   * Count total units
   */
  async count(filters = {}) {
    let query = `SELECT COUNT(*) as total FROM units u
                 LEFT JOIN buildings b ON u.building_id = b.id
                 WHERE u.deleted_at IS NULL AND b.deleted_at IS NULL`;
    const params = [];
    
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.status) {
      query += ' AND u.status = ?';
      params.push(filters.status);
    }
    
    if (filters.minBedrooms) {
      query += ' AND u.bedrooms >= ?';
      params.push(filters.minBedrooms);
    }
    
    if (filters.maxRent) {
      query += ' AND u.rent_amount <= ?';
      params.push(filters.maxRent);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },
  
  /**
   * Create new unit
   */
  async create(unitData) {
    const { buildingId, unitNumber, floor, bedrooms, bathrooms, areaSqft, rentAmount } = unitData;
    
    const [result] = await pool.execute(
      `INSERT INTO units (building_id, unit_number, floor, bedrooms, bathrooms, area_sqft, rent_amount, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [buildingId, unitNumber, floor || null, bedrooms, bathrooms, areaSqft || null, rentAmount, UNIT_STATUS.AVAILABLE]
    );
    
    return result.insertId;
  },
  
  /**
   * Update unit
   */
  async update(id, unitData) {
    const fields = [];
    const params = [];
    
    if (unitData.unitNumber) {
      fields.push('unit_number = ?');
      params.push(unitData.unitNumber);
    }
    if (unitData.floor !== undefined) {
      fields.push('floor = ?');
      params.push(unitData.floor);
    }
    if (unitData.bedrooms !== undefined) {
      fields.push('bedrooms = ?');
      params.push(unitData.bedrooms);
    }
    if (unitData.bathrooms !== undefined) {
      fields.push('bathrooms = ?');
      params.push(unitData.bathrooms);
    }
    if (unitData.areaSqft !== undefined) {
      fields.push('area_sqft = ?');
      params.push(unitData.areaSqft);
    }
    if (unitData.rentAmount !== undefined) {
      fields.push('rent_amount = ?');
      params.push(unitData.rentAmount);
    }
    if (unitData.status) {
      fields.push('status = ?');
      params.push(unitData.status);
    }
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE units SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },
  
  /**
   * Update unit status
   */
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE units SET status = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [status, id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Soft delete unit
   */
  async softDelete(id) {
    const [result] = await pool.execute(
      'UPDATE units SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Check if unit has active tenancy
   */
  async hasActiveTenancy(id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM tenancies WHERE unit_id = ? AND is_active = true',
      [id]
    );
    return rows[0].count > 0;
  },
  
  /**
   * Find units by building ID
   */
  async findByBuildingId(buildingId) {
    const [rows] = await pool.execute(
      `SELECT * FROM units WHERE building_id = ? AND deleted_at IS NULL ORDER BY unit_number`,
      [buildingId]
    );
    return rows;
  },
};

module.exports = unitRepository;
