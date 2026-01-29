const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('../shared/utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
};
