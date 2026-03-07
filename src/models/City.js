const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const City = sequelize.define('City', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  name_ar: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'cities',
  timestamps: false,
});

module.exports = City;
