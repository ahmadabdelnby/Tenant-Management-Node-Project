const { Payment, Tenancy, Unit, Building, User, sequelize } = require('../../models');
const { Op, literal } = require('sequelize');

const FULL_INCLUDE = [
  {
    model: Tenancy,
    as: 'tenancy',
    attributes: ['unit_id', 'tenant_id', 'monthly_rent', 'start_date', 'end_date', 'is_active'],
    include: [
      {
        model: Unit,
        as: 'unit',
        attributes: ['unit_number', 'building_id'],
        include: [{
          model: Building,
          as: 'building',
          attributes: ['name', 'owner_id'],
        }],
      },
      {
        model: User,
        as: 'tenant',
        attributes: ['email', 'first_name', 'last_name', 'phone'],
      },
    ],
  },
];

/**
 * Flatten nested includes for backward compatibility
 */
function flattenPayment(plain) {
  const tenancy = plain.tenancy || {};
  plain.unit_id = tenancy.unit_id || null;
  plain.tenant_id = tenancy.tenant_id || null;
  plain.monthly_rent = tenancy.monthly_rent || null;
  plain.start_date = tenancy.start_date || null;
  plain.end_date = tenancy.end_date || null;
  plain.is_active = tenancy.is_active !== undefined ? tenancy.is_active : null;
  plain.unit_number = tenancy.unit?.unit_number || null;
  plain.building_id = tenancy.unit?.building_id || null;
  plain.building_name = tenancy.unit?.building?.name || null;
  plain.owner_id = tenancy.unit?.building?.owner_id || null;
  plain.tenant_email = tenancy.tenant?.email || null;
  plain.tenant_first_name = tenancy.tenant?.first_name || null;
  plain.tenant_last_name = tenancy.tenant?.last_name || null;
  plain.tenant_phone = tenancy.tenant?.phone || null;
  delete plain.tenancy;
  return plain;
}

/**
 * Payment Repository - Database operations (Sequelize)
 */
const paymentRepository = {
  /**
   * Find payment by ID
   */
  async findById(id) {
    const payment = await Payment.findByPk(id, { include: FULL_INCLUDE });
    if (!payment) return null;
    return flattenPayment(payment.get({ plain: true }));
  },

  /**
   * Find payment by tenancy, month, and year
   */
  async findByTenancyMonthYear(tenancyId, month, year) {
    const payment = await Payment.findOne({
      where: { tenancy_id: tenancyId, month, year },
    });
    return payment ? payment.get({ plain: true }) : null;
  },

  /**
   * Find all payments with pagination and filters
   */
  async findAll(limit, offset, filters = {}) {
    const where = {};
    const tenancyWhere = {};
    const buildingWhere = {};

    if (filters.tenancyId) where.tenancy_id = filters.tenancyId;
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.status) where.status = filters.status;

    if (filters.tenantId) tenancyWhere.tenant_id = filters.tenantId;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const tenancyInclude = {
      model: Tenancy,
      as: 'tenancy',
      attributes: ['unit_id', 'tenant_id', 'monthly_rent', 'start_date', 'end_date', 'is_active'],
      where: Object.keys(tenancyWhere).length ? tenancyWhere : undefined,
      required: Object.keys(tenancyWhere).length > 0,
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['unit_number', 'building_id'],
          include: [{
            model: Building,
            as: 'building',
            attributes: ['name', 'owner_id'],
            where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
            required: Object.keys(buildingWhere).length > 0,
          }],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['email', 'first_name', 'last_name', 'phone'],
        },
      ],
    };

    if (filters.buildingId) {
      tenancyInclude.include[0].where = { building_id: filters.buildingId };
      tenancyInclude.include[0].required = true;
      tenancyInclude.required = true;
    }

    const rows = await Payment.findAll({
      where,
      include: [tenancyInclude],
      order: [['year', 'DESC'], ['month', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return rows.map(p => flattenPayment(p.get({ plain: true })));
  },

  /**
   * Count payments with filters
   */
  async count(filters = {}) {
    const where = {};
    const tenancyWhere = {};
    const buildingWhere = {};

    if (filters.tenancyId) where.tenancy_id = filters.tenancyId;
    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.status) where.status = filters.status;
    if (filters.tenantId) tenancyWhere.tenant_id = filters.tenantId;
    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const includes = [];
    const tenancyInclude = {
      model: Tenancy,
      as: 'tenancy',
      attributes: [],
      where: Object.keys(tenancyWhere).length ? tenancyWhere : undefined,
      required: Object.keys(tenancyWhere).length > 0,
      include: [],
    };

    if (Object.keys(buildingWhere).length || filters.buildingId) {
      const unitInclude = {
        model: Unit,
        as: 'unit',
        attributes: [],
        include: [],
      };
      if (Object.keys(buildingWhere).length) {
        unitInclude.include.push({
          model: Building,
          as: 'building',
          attributes: [],
          where: buildingWhere,
          required: true,
        });
      }
      if (filters.buildingId) {
        unitInclude.where = { building_id: filters.buildingId };
        unitInclude.required = true;
      }
      tenancyInclude.include.push(unitInclude);
      tenancyInclude.required = true;
    }

    if (tenancyInclude.required || Object.keys(tenancyWhere).length) {
      includes.push(tenancyInclude);
    }

    return Payment.count({ where, include: includes });
  },

  /**
   * Create a new payment record
   */
  async create(paymentData) {
    const { tenancyId, month, year, amount, status, createdBy } = paymentData;

    const payment = await Payment.create({
      tenancy_id: tenancyId,
      month,
      year,
      amount,
      status: status || 'PENDING',
      created_by: createdBy || null,
    });

    return payment.id;
  },

  /**
   * Update payment
   */
  async update(id, data) {
    const updateData = {};

    if (data.status) updateData.status = data.status;
    if (data.paymentMethod) updateData.payment_method = data.paymentMethod;
    if (data.tahseeelOrderNo !== undefined) updateData.tahseeel_order_no = data.tahseeelOrderNo;
    if (data.tahseeelHash !== undefined) updateData.tahseeel_hash = data.tahseeelHash;
    if (data.tahseeelInvId !== undefined) updateData.tahseeel_inv_id = data.tahseeelInvId;
    if (data.tahseeelPaymentLink !== undefined) updateData.tahseeel_payment_link = data.tahseeelPaymentLink;
    if (data.tahseeelTxId !== undefined) updateData.tahseeel_tx_id = data.tahseeelTxId;
    if (data.tahseeelPaymentId !== undefined) updateData.tahseeel_payment_id = data.tahseeelPaymentId;
    if (data.tahseeelResult !== undefined) updateData.tahseeel_result = data.tahseeelResult;
    if (data.tahseeelTxStatus !== undefined) updateData.tahseeel_tx_status = data.tahseeelTxStatus;
    if (data.paidAt !== undefined) updateData.paid_at = data.paidAt;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.amount !== undefined) updateData.amount = data.amount;

    if (Object.keys(updateData).length === 0) return false;

    const [affectedCount] = await Payment.update(updateData, { where: { id } });
    return affectedCount > 0;
  },

  /**
   * Delete payment
   */
  async delete(id) {
    const affectedCount = await Payment.destroy({ where: { id } });
    return affectedCount > 0;
  },

  /**
   * Generate monthly payment records for all active tenancies
   * Uses INSERT IGNORE equivalent via Sequelize bulkCreate with ignoreDuplicates
   */
  async generateMonthlyPayments(month, year) {
    // Get all active tenancies whose date range covers the target month
    const lastDay = new Date(year, month, 0); // Last day of the month
    const firstDay = new Date(year, month - 1, 1); // First day of the month

    const tenancies = await Tenancy.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: lastDay },
        [Op.or]: [
          { end_date: null },
          { end_date: { [Op.gte]: firstDay } },
        ],
      },
    });

    if (tenancies.length === 0) return 0;

    const records = tenancies.map(t => ({
      tenancy_id: t.id,
      month,
      year,
      amount: t.monthly_rent,
      status: 'PENDING',
    }));

    const result = await Payment.bulkCreate(records, {
      ignoreDuplicates: true, // equivalent of INSERT IGNORE (uses unique index)
    });

    return result.length;
  },

  /**
   * Get payment summary for a building in a specific month/year
   */
  async getBuildingPaymentSummary(buildingId, month, year) {
    const tenancies = await Tenancy.findAll({
      where: { is_active: true },
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['unit_number'],
          where: { building_id: buildingId },
          required: true,
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['first_name', 'last_name', 'email', 'phone'],
        },
        {
          model: Payment,
          as: 'payments',
          where: { month, year },
          required: false, // LEFT JOIN behavior
          attributes: ['id', 'amount', 'status', 'payment_method', 'paid_at', 'tahseeel_payment_link', 'notes'],
        },
      ],
      order: [[{ model: Unit, as: 'unit' }, 'unit_number', 'ASC']],
    });

    return tenancies.map(t => {
      const plain = t.get({ plain: true });
      const payment = plain.payments?.[0] || {};
      return {
        tenancy_id: plain.id,
        monthly_rent: plain.monthly_rent,
        start_date: plain.start_date,
        end_date: plain.end_date,
        unit_number: plain.unit?.unit_number || null,
        tenant_first_name: plain.tenant?.first_name || null,
        tenant_last_name: plain.tenant?.last_name || null,
        tenant_email: plain.tenant?.email || null,
        tenant_phone: plain.tenant?.phone || null,
        payment_id: payment.id || null,
        payment_amount: payment.amount || null,
        payment_status: payment.status || null,
        payment_method: payment.payment_method || null,
        paid_at: payment.paid_at || null,
        tahseeel_payment_link: payment.tahseeel_payment_link || null,
        notes: payment.notes || null,
      };
    });
  },

  /**
   * Get payments for export (no pagination)
   */
  async findAllForExport(filters = {}) {
    const where = {};
    const buildingWhere = {};

    if (filters.month) where.month = filters.month;
    if (filters.year) where.year = filters.year;
    if (filters.status) where.status = filters.status;

    if (filters.ownerId) buildingWhere.owner_id = filters.ownerId;

    const tenancyInclude = {
      model: Tenancy,
      as: 'tenancy',
      attributes: ['unit_id', 'tenant_id', 'monthly_rent', 'start_date', 'end_date'],
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['unit_number', 'building_id'],
          include: [{
            model: Building,
            as: 'building',
            attributes: ['name'],
            where: Object.keys(buildingWhere).length ? buildingWhere : undefined,
            required: Object.keys(buildingWhere).length > 0,
          }],
        },
        {
          model: User,
          as: 'tenant',
          attributes: ['email', 'first_name', 'last_name', 'phone'],
        },
      ],
    };

    if (filters.buildingId) {
      tenancyInclude.include[0].where = { building_id: filters.buildingId };
      tenancyInclude.include[0].required = true;
      tenancyInclude.required = true;
    }

    const rows = await Payment.findAll({
      where,
      include: [tenancyInclude],
      order: [['year', 'DESC'], ['month', 'DESC']],
    });

    return rows.map(p => {
      const plain = p.get({ plain: true });
      const tenancy = plain.tenancy || {};
      plain.unit_id = tenancy.unit_id || null;
      plain.tenant_id = tenancy.tenant_id || null;
      plain.monthly_rent = tenancy.monthly_rent || null;
      plain.start_date = tenancy.start_date || null;
      plain.end_date = tenancy.end_date || null;
      plain.unit_number = tenancy.unit?.unit_number || null;
      plain.building_id = tenancy.unit?.building_id || null;
      plain.building_name = tenancy.unit?.building?.name || null;
      plain.tenant_email = tenancy.tenant?.email || null;
      plain.tenant_first_name = tenancy.tenant?.first_name || null;
      plain.tenant_last_name = tenancy.tenant?.last_name || null;
      plain.tenant_phone = tenancy.tenant?.phone || null;
      delete plain.tenancy;
      return plain;
    });
  },

  /**
   * Mark overdue payments
   */
  async markOverduePayments() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-based

    const [affectedCount] = await Payment.update(
      { status: 'OVERDUE' },
      {
        where: {
          status: 'PENDING',
          [Op.or]: [
            { year: { [Op.lt]: currentYear } },
            {
              year: currentYear,
              month: { [Op.lt]: currentMonth },
            },
          ],
        },
      }
    );

    return affectedCount;
  },
};

module.exports = paymentRepository;
