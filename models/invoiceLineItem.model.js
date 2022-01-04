module.exports = (sequelize, Sequelize) => {
  const InvoiceLineItem = sequelize.define(
    'invoice_line_items',
    {
      charge_type: {
        type: Sequelize.STRING,
      },
      charge_description: {
        type: Sequelize.STRING,
      },
      amount_excluding_tax: {
        type: Sequelize.FLOAT,
      },
      tax_amount: {
        type: Sequelize.FLOAT,
      },
      total_amount: {
        type: Sequelize.FLOAT,
      },
      quantity: {
        type: Sequelize.INTEGER,
      },
      unit_price: {
        type: Sequelize.FLOAT,
      },
    },
    {
      timestamps: false,
    }
  );

  return InvoiceLineItem;
};
