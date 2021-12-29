module.exports = (sequelize, Sequelize) => {
  const Zillow = sequelize.define(
    "zillow",
    {
      home_type: {
        type: Sequelize.STRING,
      },
      url: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.STRING,
      },
      beds: {
        type: Sequelize.STRING,
      },
      baths: {
        type: Sequelize.STRING,
      },
      sqft: {
        type: Sequelize.STRING,
      },
      facts_and_features: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: true,
    }
  );
  return Zillow;
};
