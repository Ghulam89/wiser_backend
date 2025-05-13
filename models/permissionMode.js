module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define("permission", {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    module: {
      type: DataTypes.ENUM(
        'user_management',
        'services_packages',
        'roles_permissions',
        'documents',
        'tickets'
      ),
      allowNull: false,
    },
    canView: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canCreate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canEdit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    canDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
  });

  return Permission;
};
