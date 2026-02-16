const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../shared/utils/logger');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.nodeEnv === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true, // Use snake_case column names
      paranoid: false,   // Per-model override for soft delete
    },
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Sequelize database connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Sequelize connection failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
