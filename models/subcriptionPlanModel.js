module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define('subscriptionPlan', {
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    tier: {
      type: DataTypes.ENUM('Basic', 'Standard', 'Advanced', 'Premium'),
      allowNull: false
    },
    level: {
      type: DataTypes.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
      allowNull: false
    },
    monthlyPriceBHD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    monthlyPriceUSD: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    legalAssistance: {
      type: DataTypes.JSON,
      defaultValue: {
        consultations: 0,
        policeStationComplaints: false,
        publicProtection: false,
        forgeTasks: false,
        kitStageCourt: false,
        visagedCourts: false
      },
      get() {
        const rawValue = this.getDataValue('legalAssistance');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('legalAssistance', 
          typeof value === 'string' ? value : JSON.stringify(value || {}));
      }
    },
    support24_7: {
      type: DataTypes.JSON,
      defaultValue: {
        governmentSupport: '',
        legalFeesSupport: '',
        specialFeatures: []
      },
      get() {
        const rawValue = this.getDataValue('support24_7');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue('support24_7', 
          typeof value === 'string' ? value : JSON.stringify(value || {}));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    paranoid: true,
    getterMethods: {
      formattedPrice() {
        return `${this.monthlyPriceBHD} BHD/Month - ${this.monthlyPriceUSD} USD/Month`;
      },
      legalFeaturesList() {
        const features = [];
        if (this.legalAssistance.consultations > 0) {
          features.push(`${this.legalAssistance.consultations} Consultations`);
        }
        if (this.legalAssistance.policeStationComplaints) {
          features.push('Police Station Complaints/Defiance');
        }
        if (this.legalAssistance.publicProtection) {
          features.push('Public Protection');
        }
        if (this.legalAssistance.forgeTasks) {
          features.push('Forge Tasks');
        }
        if (this.legalAssistance.kitStageCourt) {
          features.push('Kit Stage Court');
        }
        if (this.legalAssistance.visagedCourts) {
          features.push('Visaged Courts');
        }
        return features;
      }
    }
  });

  
  return SubscriptionPlan;
};