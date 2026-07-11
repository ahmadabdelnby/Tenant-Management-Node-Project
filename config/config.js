require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // port: 5432,
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "Asia/Kuwait",
    dialectOptions: {
      timezone: "local",
      connectTimeout: 150000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 150000,
      idle: 150000,
    },
  },
  production: {
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    host: process.env.RDS_HOSTNAME,
    dialect: "mysql",
    pool: {
      max: 10,
      min: 0,
      acquire: 150000,
      idle: 150000,
    },
    port: process.env.RDS_PORT,
    sslmode: true,
    timezone: "Asia/Kuwait",
    dialectOptions: {
      timezone: "local",
      connectTimeout: 150000,
    },
  },
};
