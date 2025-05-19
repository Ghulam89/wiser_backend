module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define("service", {
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'categories',
                key: 'id',
            },
        },
        subCategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subCategories',
                key: 'id',
            },
        },
        serviceName: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true,
        },
        logo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        servicePoints: {
            type: DataTypes.JSON, 
            allowNull: true,
        },
        price: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return Service;
};