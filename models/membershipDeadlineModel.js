// models/membershipDeadline.js
module.exports = (sequelize, DataTypes) => {
  const MembershipDeadline = sequelize.define('memberShipDeadline', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    tier: {
      type: DataTypes.ENUM('Standard', 'Premium'),
      allowNull: false
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: {},
      get() {
        const rawValue = this.getDataValue('features');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('features', 
          typeof value === 'string' ? value : JSON.stringify(value || {}));
      }
    },
    responseTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    paranoid: true,
    getterMethods: {
      formattedFeatures() {
        const features = this.features;
        return Object.entries(features).map(([category, items]) => ({
          category,
          items: Array.isArray(items) ? items : [items]
        }));
      }
    }
  });

  return MembershipDeadline;
};