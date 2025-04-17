
const config = require("../config/config.js");
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  //   operatorsAliases: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    idle: config.pool.idle,
    acquire: config.pool.acquire,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to database");
    console.log("Creating tables");
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("./userModel.js")(sequelize, DataTypes);
db.sequelize.sync({ force: false }).then(() => {
  console.log("Yes Re-Sync Complete");
});


module.exports = db;
