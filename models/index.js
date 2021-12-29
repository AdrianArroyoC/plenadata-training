const config = require("../config");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    define: {
      charset: "utf8",
      collate: "utf8_general_ci",
    },
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle,
    },
  }
);

const db = {
  Sequelize,
  sequelize,
  zillow: require("./zillow.model")(sequelize, Sequelize),
};

module.exports = db;
