const { pool } = require('../../config/database');

/**
 * User Repository - Database operations
 */
const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at 
       FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },
  
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at 
       FROM users WHERE email = ? AND deleted_at IS NULL`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  },
  
  /**
   * Find all users with pagination
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at 
                 FROM users WHERE deleted_at IS NULL`;
    const params = [];
    
    // Apply filters
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive ? 1 : 0);
    }
    
    if (filters.search) {
      query += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  
  /**
   * Count total users
   */
  async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL';
    const params = [];
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive ? 1 : 0);
    }
    
    if (filters.search) {
      query += ' AND (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },
  
  /**
   * Create new user
   */
  async create(userData) {
    const { email, passwordHash, firstName, lastName, role } = userData;
    
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, true, NOW(), NOW())`,
      [email.toLowerCase(), passwordHash, firstName, lastName, role]
    );
    
    return result.insertId;
  },
  
  /**
   * Update user
   */
  async update(id, userData) {
    const fields = [];
    const params = [];
    
    if (userData.email) {
      fields.push('email = ?');
      params.push(userData.email.toLowerCase());
    }
    if (userData.firstName) {
      fields.push('first_name = ?');
      params.push(userData.firstName);
    }
    if (userData.lastName) {
      fields.push('last_name = ?');
      params.push(userData.lastName);
    }
    if (userData.role) {
      fields.push('role = ?');
      params.push(userData.role);
    }
    if (userData.isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(userData.isActive);
    }
    if (userData.passwordHash) {
      fields.push('password_hash = ?');
      params.push(userData.passwordHash);
    }
    
    fields.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
    
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },
  
  /**
   * Soft delete user
   */
  async softDelete(id) {
    const [result] = await pool.execute(
      'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Deactivate user
   */
  async deactivate(id) {
    const [result] = await pool.execute(
      'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
  
  /**
   * Activate user
   */
  async activate(id) {
    const [result] = await pool.execute(
      'UPDATE users SET is_active = true, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = userRepository;
