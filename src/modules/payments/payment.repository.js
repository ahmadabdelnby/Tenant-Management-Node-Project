const { pool } = require('../../config/database');

/**
 * Payment Repository - Database operations
 */
const paymentRepository = {
  /**
   * Find payment by ID
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*,
              t.unit_id, t.tenant_id, t.monthly_rent, t.start_date, t.end_date, t.is_active,
              u.unit_number, u.building_id,
              b.name as building_name, b.owner_id,
              tenant.email as tenant_email, tenant.first_name as tenant_first_name, 
              tenant.last_name as tenant_last_name, tenant.phone as tenant_phone
       FROM payments p
       LEFT JOIN tenancies t ON p.tenancy_id = t.id
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN users tenant ON t.tenant_id = tenant.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find payment by tenancy, month, and year
   */
  async findByTenancyMonthYear(tenancyId, month, year) {
    const [rows] = await pool.execute(
      `SELECT * FROM payments WHERE tenancy_id = ? AND month = ? AND year = ?`,
      [tenancyId, month, year]
    );
    return rows[0] || null;
  },

  /**
   * Find all payments with pagination and filters
   */
  async findAll(limit, offset, filters = {}) {
    let query = `SELECT p.*,
                        t.unit_id, t.tenant_id, t.monthly_rent, t.start_date, t.end_date, t.is_active,
                        u.unit_number, u.building_id,
                        b.name as building_name, b.owner_id,
                        tenant.email as tenant_email, tenant.first_name as tenant_first_name, 
                        tenant.last_name as tenant_last_name, tenant.phone as tenant_phone
                 FROM payments p
                 LEFT JOIN tenancies t ON p.tenancy_id = t.id
                 LEFT JOIN units u ON t.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 LEFT JOIN users tenant ON t.tenant_id = tenant.id
                 WHERE 1=1`;
    const params = [];

    if (filters.tenancyId) {
      query += ' AND p.tenancy_id = ?';
      params.push(filters.tenancyId);
    }
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    if (filters.tenantId) {
      query += ' AND t.tenant_id = ?';
      params.push(filters.tenantId);
    }
    if (filters.month) {
      query += ' AND p.month = ?';
      params.push(filters.month);
    }
    if (filters.year) {
      query += ' AND p.year = ?';
      params.push(filters.year);
    }
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    query += ` ORDER BY p.year DESC, p.month DESC, b.name ASC, u.unit_number ASC
               LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Count payments with filters
   */
  async count(filters = {}) {
    let query = `SELECT COUNT(*) as total
                 FROM payments p
                 LEFT JOIN tenancies t ON p.tenancy_id = t.id
                 LEFT JOIN units u ON t.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 WHERE 1=1`;
    const params = [];

    if (filters.tenancyId) {
      query += ' AND p.tenancy_id = ?';
      params.push(filters.tenancyId);
    }
    if (filters.buildingId) {
      query += ' AND u.building_id = ?';
      params.push(filters.buildingId);
    }
    if (filters.ownerId) {
      query += ' AND b.owner_id = ?';
      params.push(filters.ownerId);
    }
    if (filters.tenantId) {
      query += ' AND t.tenant_id = ?';
      params.push(filters.tenantId);
    }
    if (filters.month) {
      query += ' AND p.month = ?';
      params.push(filters.month);
    }
    if (filters.year) {
      query += ' AND p.year = ?';
      params.push(filters.year);
    }
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  /**
   * Create a new payment record
   */
  async create(paymentData) {
    const { tenancyId, month, year, amount, status, createdBy } = paymentData;
    const [result] = await pool.execute(
      `INSERT INTO payments (tenancy_id, month, year, amount, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [tenancyId, month, year, amount, status || 'PENDING', createdBy || null]
    );
    return result.insertId;
  },

  /**
   * Update payment
   */
  async update(id, data) {
    const fields = [];
    const params = [];

    if (data.status) {
      fields.push('status = ?');
      params.push(data.status);
    }
    if (data.paymentMethod) {
      fields.push('payment_method = ?');
      params.push(data.paymentMethod);
    }
    if (data.tahseeelOrderNo !== undefined) {
      fields.push('tahseeel_order_no = ?');
      params.push(data.tahseeelOrderNo);
    }
    if (data.tahseeelHash !== undefined) {
      fields.push('tahseeel_hash = ?');
      params.push(data.tahseeelHash);
    }
    if (data.tahseeelInvId !== undefined) {
      fields.push('tahseeel_inv_id = ?');
      params.push(data.tahseeelInvId);
    }
    if (data.tahseeelPaymentLink !== undefined) {
      fields.push('tahseeel_payment_link = ?');
      params.push(data.tahseeelPaymentLink);
    }
    if (data.tahseeelTxId !== undefined) {
      fields.push('tahseeel_tx_id = ?');
      params.push(data.tahseeelTxId);
    }
    if (data.tahseeelPaymentId !== undefined) {
      fields.push('tahseeel_payment_id = ?');
      params.push(data.tahseeelPaymentId);
    }
    if (data.tahseeelResult !== undefined) {
      fields.push('tahseeel_result = ?');
      params.push(data.tahseeelResult);
    }
    if (data.tahseeelTxStatus !== undefined) {
      fields.push('tahseeel_tx_status = ?');
      params.push(data.tahseeelTxStatus);
    }
    if (data.paidAt !== undefined) {
      fields.push('paid_at = ?');
      params.push(data.paidAt);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      params.push(data.notes);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      params.push(data.amount);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = NOW()');
    params.push(id);

    const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, params);
    return result.affectedRows > 0;
  },

  /**
   * Delete payment
   */
  async delete(id) {
    const [result] = await pool.execute('DELETE FROM payments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Generate monthly payment records for all active tenancies
   */
  async generateMonthlyPayments(month, year) {
    const [result] = await pool.execute(
      `INSERT IGNORE INTO payments (tenancy_id, month, year, amount, status, created_at, updated_at)
       SELECT t.id, ?, ?, t.monthly_rent, 'PENDING', NOW(), NOW()
       FROM tenancies t
       WHERE t.is_active = 1
         AND t.start_date <= LAST_DAY(CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))
         AND (t.end_date IS NULL OR t.end_date >= CONCAT(?, '-', LPAD(?, 2, '0'), '-01'))`,
      [month, year, year, month, year, month]
    );
    return result.affectedRows;
  },

  /**
   * Get payment summary for a building in a specific month/year
   */
  async getBuildingPaymentSummary(buildingId, month, year) {
    const [rows] = await pool.execute(
      `SELECT 
        t.id as tenancy_id,
        t.monthly_rent,
        t.start_date,
        t.end_date,
        u.unit_number,
        tenant.first_name as tenant_first_name,
        tenant.last_name as tenant_last_name,
        tenant.email as tenant_email,
        tenant.phone as tenant_phone,
        p.id as payment_id,
        p.amount as payment_amount,
        p.status as payment_status,
        p.payment_method,
        p.paid_at,
        p.tahseeel_payment_link,
        p.notes
       FROM tenancies t
       LEFT JOIN units u ON t.unit_id = u.id
       LEFT JOIN buildings b ON u.building_id = b.id
       LEFT JOIN users tenant ON t.tenant_id = tenant.id
       LEFT JOIN payments p ON p.tenancy_id = t.id AND p.month = ? AND p.year = ?
       WHERE u.building_id = ?
         AND t.is_active = 1
       ORDER BY u.unit_number ASC`,
      [month, year, buildingId]
    );
    return rows;
  },

  /**
   * Get payments for export (no pagination)
   */
  async findAllForExport(filters = {}) {
    let query = `SELECT p.*,
                        t.unit_id, t.tenant_id, t.monthly_rent, t.start_date, t.end_date,
                        u.unit_number, u.building_id,
                        b.name as building_name,
                        tenant.email as tenant_email, tenant.first_name as tenant_first_name, 
                        tenant.last_name as tenant_last_name, tenant.phone as tenant_phone
                 FROM payments p
                 LEFT JOIN tenancies t ON p.tenancy_id = t.id
                 LEFT JOIN units u ON t.unit_id = u.id
                 LEFT JOIN buildings b ON u.building_id = b.id
                 LEFT JOIN users tenant ON t.tenant_id = tenant.id
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
    if (filters.month) {
      query += ' AND p.month = ?';
      params.push(filters.month);
    }
    if (filters.year) {
      query += ' AND p.year = ?';
      params.push(filters.year);
    }
    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY b.name ASC, u.unit_number ASC, p.year DESC, p.month DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  /**
   * Mark overdue payments
   */
  async markOverduePayments() {
    const [result] = await pool.execute(
      `UPDATE payments 
       SET status = 'OVERDUE', updated_at = NOW()
       WHERE status = 'PENDING' 
         AND CONCAT(year, '-', LPAD(month, 2, '0'), '-01') < DATE_FORMAT(NOW(), '%Y-%m-01')`
    );
    return result.affectedRows;
  },
};

module.exports = paymentRepository;
