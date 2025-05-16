// models/auditLog.js
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('auditLog', {
    action: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    resource: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      }
    }
  }, {
    underscored: false,
    timestamps: true,
  });

  return AuditLog;
};