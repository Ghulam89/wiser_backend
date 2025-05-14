module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define("category", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: DataTypes.STRING,
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
