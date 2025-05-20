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
db.ticketSupport = require("./ticketSupportModel.js")(sequelize, DataTypes);
db.chatRoom = require("./chatRoomModel.js")(sequelize, DataTypes);
db.chatMessage = require("./chatMessageModel.js")(sequelize, DataTypes);
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

 
  // Chat associations
  db.admin.hasMany(db.chatRoom, { 
    foreignKey: 'adminId', 
    as: 'chatRooms' 
  });
  
  db.user.hasMany(db.chatRoom, { 
    foreignKey: 'userId', 
    as: 'chatRooms' 
  });
  
  db.chatRoom.belongsTo(db.admin, { 
    foreignKey: 'adminId', 
    as: 'admin' 
  });
  
  db.chatRoom.belongsTo(db.user, { 
    foreignKey: 'userId', 
    as: 'user' 
  });

  db.chatRoom.hasMany(db.chatMessage, { 
    foreignKey: 'roomId', 
    as: 'messages',
    onDelete: 'CASCADE'
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
   db.ticketSupport.belongsTo(db.user, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE'
  });

  db.ticketSupport.belongsTo(db.admin, {
    foreignKey: 'adminId',
    as: 'admin',
    onDelete: 'CASCADE'
  });
    db.ticketSupport.belongsTo(db.chatRoom, {
    foreignKey: 'roomId',
    as: 'chatRooms',
    onDelete: 'CASCADE'
  });
}

setupAssociations();

db.sequelize.sync({ force: false }).then(() => {
  console.log("Yes Re-Sync Complete");
});

module.exports = db;
