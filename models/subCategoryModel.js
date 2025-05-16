module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define("subCategory", {
      categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories', 
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

  return SubCategory;
};
