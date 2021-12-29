require("dotenv").config();

module.exports = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3000,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "123456",
  database: process.env.DB_NAME || "test",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
