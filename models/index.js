const config = require('../config');

const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    port: config.db.port,
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    pool: {
      max: config.db.pool.max,
      min: config.db.pool.min,
      acquire: config.db.pool.acquire,
      idle: config.db.pool.idle,
    },
  }
);

const db = {
  Sequelize,
  sequelize,
  zillow: require('./zillow.model')(sequelize, Sequelize),
  slack: require('./slack.model')(sequelize, Sequelize),
};

module.exports = db;
