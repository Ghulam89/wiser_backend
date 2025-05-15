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
db.user = require("./userModel.js")(sequelize, DataTypes);
db.category = require("./categoryModel.js")(sequelize, DataTypes);
db.subCategory = require("./subCategoryModel.js")(sequelize, DataTypes);
db.service = require("./serviceModel.js")(sequelize, DataTypes);
db.auditLog = require("./auditLogModel.js")(sequelize, DataTypes);

// Define associations
function setupAssociations() {
  db.category.hasMany(db.subCategory, {
    foreignKey: "categoryId",
    as: "subCategories",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  db.subCategory.belongsTo(db.category, {
    foreignKey: "categoryId",
    as: "category",
    constraints: true,
  });

  db.category.hasMany(db.service, {
    foreignKey: "categoryId",
    as: "services",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  db.service.belongsTo(db.category, {
    foreignKey: "categoryId",
    as: "category",
    constraints: true,
  });

  db.subCategory.hasMany(db.service, {
    foreignKey: "subCategoryId",
    as: "services",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  db.service.belongsTo(db.subCategory, {
    foreignKey: "subCategoryId",
    as: "subCategory",
    constraints: true,
  });
}

setupAssociations();

db.sequelize.sync({ force: false }).then(() => {
  console.log("Yes Re-Sync Complete");
});

module.exports = db;
