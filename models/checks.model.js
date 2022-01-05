module.exports = (sequelize, Sequelize) => {
  const Check = sequelize.define(
    'check',
    {
      check_number: {
        type: Sequelize.INTEGER,
      },
      amount: {
        type: Sequelize.FLOAT,
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

  return Check;
};
