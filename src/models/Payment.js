const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tenancy_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID'),
    defaultValue: 'PENDING',
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'BANK_TRANSFER', 'TAHSEEEL', 'OTHER'),
    allowNull: true,
  },
  tahseeel_order_no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tahseeel_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tahseeel_inv_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tahseeel_payment_link: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tahseeel_tx_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tahseeel_payment_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tahseeel_result: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tahseeel_tx_status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'payments',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['tenancy_id', 'month', 'year'],
      name: 'unique_payment',
    },
  ],
});

module.exports = Payment;
