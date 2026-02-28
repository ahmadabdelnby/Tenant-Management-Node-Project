const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const PaymentLink = sequelize.define('PaymentLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  cust_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
  },
  payment_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Pending',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'payment_links',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = PaymentLink;
