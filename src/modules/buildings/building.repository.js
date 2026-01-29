const { pool } = require('../../config/database');

/**
 * Building Repository - Database operations
 */
const buildingRepository = {
  /**
   * Find building by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, u.email as owner_email, u.first_name as owner_first_name, u.last_name as owner_last_name
       FROM buildings b
       LEFT JOIN users u ON b.owner_id = u.id
       WHERE b.id = ? AND b.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },
  
  /**
   * Find all buildings with pagination
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT b.*, u.email as owner_email, u.first_name as owner_first_name, u.last_name as owner_last_name,
                 (SELECT COUNT(*) FROM units WHERE building_id = b.id AND deleted_at IS NULL) as total_units
                 FROM buildings b
                 LEFT JOIN users u ON b.owner_id = u.id
                 WHERE b.deleted_at IS NULL`;
    const params = [];
    
    // Apply filters
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.city) {
      query += ' AND b.city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    
    if (filters.search) {
      query += ' AND (b.name LIKE ? OR b.address LIKE ? OR b.city LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add ordering and pagination
    query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  
  /**
   * Count total buildings
   */
  async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM buildings WHERE deleted_at IS NULL';
    const params = [];
    
    if (filters.ownerId) {
      query += ' AND owner_id = ?';
      params.push(filters.ownerId);
    }
    
    if (filters.city) {
      query += ' AND city LIKE ?';
      params.push(`%${filters.city}%`);
    }
    
    if (filters.search) {
      query += ' AND (name LIKE ? OR address LIKE ? OR city LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },
  
  /**
   * Create new building
   */
  async create(buildingData) {
    const { name, address, city, postalCode, country, ownerId } = buildingData;
    
    const [result] = await pool.execute(
      `INSERT INTO buildings (name, address, city, postal_code, country, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, address, city, postalCode || null, country, ownerId]
    );
    
    return result.insertId;
  },
  
  /**
   * Update building
   */
  async update(id, buildingData) {
    const fields = [];
    const params = [];
    
    if (buildingData.name) {
      fields.push('name = ?');
      params.push(buildingData.name);
    }
    if (buildingData.address) {
      fields.push('address = ?');
      params.push(buildingData.address);
    }
    if (buildingData.city) {
      fields.push('city = ?');
      params.push(buildingData.city);
    }
    if (buildingData.postalCode !== undefined) {
      fields.push('postal_code = ?');
      params.push(buildingData.postalCode || null);
    }
    if (buildingData.country) {
      fields.push('country = ?');
      params.push(buildingData.country);
    }
    if (buildingData.ownerId) {
      fields.push('owner_id = ?');
      params.push(buildingData.ownerId);
    }
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE buildings SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },
  
  /**
   * Soft delete building
   */
  async softDelete(id) {
    const [result] = await pool.execute(
      'UPDATE buildings SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Check if building has units
   */
  async hasUnits(id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM units WHERE building_id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0].count > 0;
  },
  
  /**
   * Get buildings by owner ID
   */
  async findByOwnerId(ownerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM buildings WHERE owner_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [ownerId]
    );
    return rows;
  },
};

module.exports = buildingRepository;
