module.exports = (sequelize, DataTypes) => {
  const ticketSupport = sequelize.define("ticketSupport", {
    ticketNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    issue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chatRooms',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium'
    },
    description: {
      type: DataTypes.TEXT
    },
    subject: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
  });

  return ticketSupport;
};