module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admin', {
    role: {
      type: DataTypes.ENUM('Super Admin', 'Operations Admin', 'Admin Staff', 'Tech Admin'),
      allowNull: false,
      defaultValue: 'Super Admin'
    },
     permissions: {
      type: DataTypes.JSON,
      get() {
        const rawValue = this.getDataValue('permissions');
        try {
          return rawValue ? JSON.parse(rawValue) : {};
        } catch (e) {
          return {};
        }
      },
      set(value) {
        this.setDataValue('permissions', 
          typeof value === 'string' ? value : JSON.stringify(value || {}));
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
     profile: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otp: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    underscored: false,
    timestamps: true,
  });

  return Admin;
}