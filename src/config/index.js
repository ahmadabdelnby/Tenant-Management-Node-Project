require('dotenv').config();

module.exports = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'Tenant_Mangement_App',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_not_for_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};
