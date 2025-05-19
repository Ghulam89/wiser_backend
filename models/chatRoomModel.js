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

    ChatRoom.associate = (models) => {
        ChatRoom.belongsTo(models.admin, { foreignKey: 'adminId', as: 'admin' });
        ChatRoom.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        ChatRoom.hasMany(models.chatMessage, { 
            foreignKey: 'roomId', 
            as: 'messages',
            onDelete: 'CASCADE'
        });
    };

    return ChatRoom;
};