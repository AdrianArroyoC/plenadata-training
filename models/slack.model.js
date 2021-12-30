module.exports = (sequelize, Sequelize) => {
  const Slack = sequelize.define(
    'slack',
    {
      user: {
        type: Sequelize.STRING,
      },
      date: {
        type: Sequelize.DATE,
      },
      text: {
        type: Sequelize.TEXT,
      },
      replies: {
        type: Sequelize.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  return Slack;
};
