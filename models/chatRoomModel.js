
module.exports = (sequelize, DataTypes) => {
    const ChatRoom = sequelize.define('chatRoom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        lastActivity: {
            type: DataTypes.DATE,
            allowNull: false
        }
    });

    ChatRoom.associate = (models) => {
        ChatRoom.belongsTo(models.admin, { foreignKey: 'adminId' });
        ChatRoom.belongsTo(models.user, { foreignKey: 'userId' });
        ChatRoom.hasMany(models.chatMessage, { foreignKey: 'roomId', as: 'messages' });
    };

    return ChatRoom;
};

