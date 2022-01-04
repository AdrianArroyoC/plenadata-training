module.exports = (sequelize, Sequelize) => {
  const Invoice = sequelize.define(
    'invoice',
    {
      type: {
        type: Sequelize.STRING,
      },
      company_name: {
        type: Sequelize.STRING,
      },
      invoice_number: {
        type: Sequelize.INTEGER,
      },
      process_order_number: {
        type: Sequelize.INTEGER,
      },
      date: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );

  return Invoice;
};
