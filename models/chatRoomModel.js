module.exports = (sequelize, DataTypes) => {
    const ChatRoom = sequelize.define('chatRoom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'admins',
        key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
},
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        lastActivity: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });

   

    return ChatRoom;
};