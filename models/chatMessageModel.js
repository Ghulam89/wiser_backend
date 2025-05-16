module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('chatMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    ChatMessage.associate = (models) => {
        ChatMessage.belongsTo(models.chatRoom, { foreignKey: 'roomId' });
    };

    return ChatMessage;
};