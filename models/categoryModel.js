module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("category", {
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return Category;
};
