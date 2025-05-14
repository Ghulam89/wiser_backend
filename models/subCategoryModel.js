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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    
  }, {
    timestamps: true,
  });

  return SubCategory;
};
