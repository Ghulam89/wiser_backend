const db = require("../models/index.js");
const { Op } = require("sequelize");
const optionTemplates = require("../utils/optionTemplates.js");

const activeConnections = {
    users: {},
    admins: {}
};

const connectionManager = {
    addConnection: (userId, socketId, isAdmin) => {
        console.log(userId, socketId, isAdmin);
        
        const store = isAdmin ? activeConnections.admins : activeConnections.users;
        store[userId] = socketId;
        console.log(`${isAdmin ? 'Admin' : 'User'} ${userId} connected with socket ID ${socketId}`);
    },

    removeConnection: (socketId) => {
        // Check admins first
        for (const [adminId, sockId] of Object.entries(activeConnections.admins)) {
            if (sockId === socketId) {
                delete activeConnections.admins[adminId];
                console.log(`Admin ${adminId} disconnected`);
                return;
            }
        }

        // Check users if not found in admins
        for (const [userId, sockId] of Object.entries(activeConnections.users)) {
            if (sockId === socketId) {
                delete activeConnections.users[userId];
                console.log(`User ${userId} disconnected`);
                return;
            }
        }
    },

    getUserSocket: (userId) => activeConnections.users[userId],
    getAdminSocket: (adminId) => activeConnections.admins[adminId]
};

// Chat Room Operations
const chatRoomService = {
    getOrCreateRoom: async (adminId, userId) => {
        const [room,created] = await db.chatRoom.findOrCreate({
            where: { adminId, userId },
            defaults: {
                adminId,
                userId,
                lastActivity: new Date()
            }
        });
        if (created) {
            await db.chatMessage.create({
                roomId: room.id,
                content: optionTemplates.initialOptions.text,
                isAdmin: true,
                isRead: false,
                messageType: 'options',
                options: optionTemplates.initialOptions.options
            });
        }
        return room;
    },

    storeMessage: async (roomId, senderId, content, isAdmin) => {
        const transaction = await db.sequelize.transaction();
        try {
            const message = await db.chatMessage.create({
                roomId,
                content,
                isAdmin,
                isRead: false,
                
            }, { transaction });

            await db.chatRoom.update(
                { lastActivity: new Date() },
                { where: { id: roomId }, transaction }
            );

            await transaction.commit();
            return message;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    getUserRooms: async (userId, isAdmin) => {
        const include = [
            {
                model: db.chatMessage,
                as: 'messages',
                separate: true,
                order: [['createdAt', 'DESC']],
                limit: 1
            }
        ];

        if (isAdmin) {
            include.push({
                model: db.user,
                as: 'user',
                attributes: ['id', 'fullName', 'email', 'phone']
            });
        } else {
            include.push({
                model: db.admin,
                as: 'admin',
                attributes: ['id', 'name', 'email']
            });
        }

        return await db.chatRoom.findAll({
            where: isAdmin ? { adminId: userId } : { userId },
            include,
            order: [['lastActivity', 'DESC']]
        });
    },

    markMessagesAsRead: async (roomId, userId, isAdmin) => {
        await db.chatMessage.update(
            { isRead: true },
            {
                where: {
                    roomId,
                    isAdmin: !isAdmin, // Mark messages from the other party as read
                    isRead: false
                }
            }
        );
    }
};

// Notification Service
const notificationService = {
    refreshRooms: async (io, adminId, userId) => {
        const promises = [];
        
        if (adminId) {
            const adminSocketId = connectionManager.getAdminSocket(adminId);
            if (adminSocketId) {
                promises.push(
                    chatRoomService.getUserRooms(adminId, true)
                        .then(rooms => io.to(adminSocketId).emit('adminRooms', { rooms }))
                );
            }
        }

        if (userId) {
            const userSocketId = connectionManager.getUserSocket(userId);
            if (userSocketId) {
                promises.push(
                    chatRoomService.getUserRooms(userId, false)
                        .then(rooms => io.to(userSocketId).emit('userRooms', { rooms }))
                );
            }
        }

        await Promise.all(promises);
    },

    notifyNewMessage: (io, { toAdmin, toUser, message, senderId, isAdmin }) => {
        if (toAdmin) {
            const adminSocketId = connectionManager.getAdminSocket(toAdmin);
            if (adminSocketId) {
                io.to(adminSocketId).emit('newMessage', {
                    senderId,
                    message,
                    isAdmin,
                    isOwnMessage: false
                });
            }
        }

        if (toUser) {
            const userSocketId = connectionManager.getUserSocket(toUser);
            if (userSocketId) {
                io.to(userSocketId).emit('newMessage', {
                    senderId,
                    message,
                    isAdmin,
                    isOwnMessage: false
                });
            }
        }
    }
};

// Socket Event Handlers
const socketHandlers = {
    handleSetUser: async (socket, { userId, isAdmin = false }) => {
        if (!userId) throw new Error('User ID is required');
        
        connectionManager.addConnection(userId, socket.id, isAdmin);
        const rooms = await chatRoomService.getUserRooms(userId, isAdmin);
        socket.emit(isAdmin ? 'adminRooms' : 'userRooms', { rooms });
    },

    handleAdminMessage: async (socket,io, { message, targetUserId, senderAdminId, isOptions = false, options = [] }) => {
        console.log(message);
        
        const room = await chatRoomService.getOrCreateRoom(senderAdminId, targetUserId);

         const messageData = {
        roomId: room.id,
        content: message,
        isAdmin: true,
        isRead: false
    };

    if (isOptions) {
        messageData.messageType = 'options';
        messageData.options = options;
    }
     await db.chatMessage.create(messageData);

        
        notificationService.notifyNewMessage(io, {
           toUser: targetUserId,
        message,
        senderId: senderAdminId,
        isAdmin: true,
        isOptions,
        options
            
        });
        
        await notificationService.refreshRooms(io, senderAdminId, targetUserId);
    },

    handleUserMessage: async (socket, io, { message, targetAdminId, senderUserId, isOptionResponse, optionValue }) => {
    const room = await chatRoomService.getOrCreateRoom(targetAdminId, senderUserId);
    
    await db.chatMessage.create({
        roomId: room.id,
        content: message,
        isAdmin: false,
        isRead: false,
        ...(isOptionResponse && { isOptionResponse: true, optionValue })
    });
    
    notificationService.notifyNewMessage(io, {
        toAdmin: targetAdminId,
        message,
        senderId: senderUserId,
        isAdmin: false,
        isOptionResponse,
        optionValue
    });
    
    await notificationService.refreshRooms(io, targetAdminId, senderUserId);
},

    handleMarkAsRead: async (socket, { roomId, userId, isAdmin }) => {
        await chatRoomService.markMessagesAsRead(roomId, userId, isAdmin);
    }
};

// Main Socket Initialization
function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        // Error wrapper for socket events
        const withErrorHandling = (handler) => async (...args) => {
            try {
                await handler(...args);
            } catch (err) {
                console.error('Socket error:', err);
                socket.emit('error', { message: err.message || 'An error occurred' });
            }
        };

        // Event listeners
        socket.on('setUser', withErrorHandling(
            (data) => socketHandlers.handleSetUser(socket, data)
        ));

        socket.on('adminChatMessage', withErrorHandling(
            (data) => {
                  console.log(data);
                  
                socketHandlers.handleAdminMessage(socket,io,data)}
        ));

        socket.on('userChatMessage', withErrorHandling(
            (data) => socketHandlers.handleUserMessage(socket,io, data)
        ));

        socket.on('markAsRead', withErrorHandling(
            (data) => socketHandlers.handleMarkAsRead(socket, data)
        ));

        socket.on('disconnect', () => {
            connectionManager.removeConnection(socket.id);
        });
    });
}

module.exports = initializeSocket;