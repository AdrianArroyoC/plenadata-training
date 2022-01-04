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

const Invoice = require('./invoice.model')(sequelize, Sequelize);
const InvoiceLineItem = require('./invoiceLineItem.model')(
  sequelize,
  Sequelize
);
Invoice.hasMany(InvoiceLineItem);
InvoiceLineItem.belongsTo(Invoice);

const db = {
  Sequelize,
  sequelize,
  zillow: require('./zillow.model')(sequelize, Sequelize),
  slack: require('./slack.model')(sequelize, Sequelize),
  invoice: Invoice,
  invoiceLineItem: InvoiceLineItem,
};

module.exports = db;
