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
            get() {
                const rawValue = this.getDataValue('servicePoints');
                if (typeof rawValue === 'string') {
                    try {
                        return JSON.parse(rawValue);
                    } catch (e) {
                        console.error('Error parsing servicePoints JSON:', e);
                        return [];
                    }
                }
                return rawValue || [];
            },
            set(value) {
                if (Array.isArray(value)) {
                    this.setDataValue('servicePoints', value);
                } else if (typeof value === 'string') {
                    try {
                        // Handle case where string might already be JSON
                        const parsed = JSON.parse(value);
                        this.setDataValue('servicePoints', Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        // If not JSON, treat as single value array
                        this.setDataValue('servicePoints', [value]);
                    }
                } else {
                    this.setDataValue('servicePoints', []);
                }
            }
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