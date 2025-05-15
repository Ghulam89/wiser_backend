module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('admin', {
    role: {
      type: DataTypes.ENUM('Super Admin', 'Operations Admin', 'Admin Staff', 'Tech Admin'),
      allowNull: false,
      defaultValue: 'Super Admin'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
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