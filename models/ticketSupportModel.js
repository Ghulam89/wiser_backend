module.exports = (sequelize, DataTypes) => {
  const ticketSupport = sequelize.define("ticketSupport", {
      ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tickets', 
        key: 'id',
      },
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    
  }, {
    timestamps: true,
  });

  return ticketSupport;
};
