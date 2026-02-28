const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Building = sequelize.define('Building', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  name_ar: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  description_ar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  map_embed: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
}, {
  tableName: 'buildings',
  paranoid: true,
  deletedAt: 'deleted_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Building;
