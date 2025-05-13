
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
db.admin = require("./adminModel.js")(sequelize, DataTypes);
db.role = require("./roleModel.js")(sequelize, DataTypes);
db.permission = require("./permissionMode.js")(sequelize, DataTypes);

db.role.hasMany(db.admin, { foreignKey: "roleId", as: "admins" });
db.admin.belongsTo(db.role, { foreignKey: "roleId", as: "adminRole" });

// Role ↔ Permission
db.role.hasMany(db.permission, { foreignKey: "roleId", as: "permissions" });
db.permission.belongsTo(db.role, { foreignKey: "roleId", as: "role" });


db.sequelize.sync({ force: false }).then(() => {
  console.log("Yes Re-Sync Complete");
});


module.exports = db;
