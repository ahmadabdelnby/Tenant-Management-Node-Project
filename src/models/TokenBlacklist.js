const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  token_jti: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'token_blacklist',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = TokenBlacklist;
