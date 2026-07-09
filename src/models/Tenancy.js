const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Tenancy = sequelize.define('Tenancy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  unit_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  monthly_rent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  first_party_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  second_party_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  first_party_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  second_party_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contract_duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contract_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'tenancies',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Tenancy;
