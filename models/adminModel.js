module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admin', {
    role: {
      type: DataTypes.ENUM('Super Admin', 'Operations Admin', 'Admin Staff', 'Tech Admin'),
      allowNull: false,
      defaultValue: 'Super Admin'
    },
     permissions: {
      type: DataTypes.TEXT,
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
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