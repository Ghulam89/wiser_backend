module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('chatMessage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chatRooms',
                key: 'id'
            }
        },
        messageType: {
            type: DataTypes.ENUM('text', 'options'),
            defaultValue: 'text'
        },
   
  options: {
            type: DataTypes.JSON,
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('options');
                if (typeof rawValue === 'string') {
                    try {
                        return JSON.parse(rawValue);
                    } catch (e) {
                        console.error('Error parsing options JSON:', e);
                        return [];
                    }
                }
                return rawValue || [];
            },
            set(value) {
                if (Array.isArray(value)) {
                    this.setDataValue('options', value);
                } else if (typeof value === 'string') {
                    try {
                        // Handle case where string might already be JSON
                        const parsed = JSON.parse(value);
                        this.setDataValue('options', Array.isArray(parsed) ? parsed : []);
                    } catch (e) {
                        // If not JSON, treat as single value array
                        this.setDataValue('options', [value]);
                    }
                } else {
                    this.setDataValue('options', []);
                }
            }
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
        ChatMessage.belongsTo(models.chatRoom, { 
            foreignKey: 'roomId',
            as: 'room'
        });
    };

    return ChatMessage;
};