const { chatRoom, chatMessage, admin, user } = require("../models/index.js");
const { Op } = require("sequelize");

// Store active connections
const activeConnections = {};

async function storeSocketConnection(userId, socketId, isAdmin) {
    activeConnections[socketId] = { userId, isAdmin };
    if (isAdmin) {
        console.log(`Admin ${userId} connected with socket ID ${socketId}`);
    } else {
        console.log(`User ${userId} connected with socket ID ${socketId}`);
    }
}

async function removeSocketConnection(socketId) {
    if (activeConnections[socketId]) {
        const { userId, isAdmin } = activeConnections[socketId];
        delete activeConnections[socketId];
        console.log(`${isAdmin ? 'Admin' : 'User'} ${userId} disconnected`);
    }
}

async function getUserSocketId(userId) {
    for (const [socketId, data] of Object.entries(activeConnections)) {
        if (!data.isAdmin && data.userId == userId) {
            return socketId;
        }
    }
    return null;
}

async function getAdminSocketId(adminId) {
    for (const [socketId, data] of Object.entries(activeConnections)) {
        if (data.isAdmin && data.userId == adminId) {
            return socketId;
        }
    }
    return null;
}

async function getOrCreateAdminRoom(adminId, userId) {
    let room = await chatRoom.findOne({
        where: {
            adminId,
            userId
        }
    });

    if (!room) {
        room = await chatRoom.create({
            adminId,
            userId,
            lastActivity: new Date()
        });
    }

    return room;
}

async function storeMessage(roomId, senderId, content, isAdmin) {
    const message = await chatMessage.create({
        roomId,
        content,
        isAdmin,
        isRead: false
    });

    // Update room's last activity
    await chatRoom.update(
        { lastActivity: new Date() },
        { where: { id: roomId } }
    );

    return message;
}

async function getUserRooms(userId, isAdmin) {
    const options = {
        include: [
            {
                model: chatMessage,
                as: 'messages',
                order: [['createdAt', 'DESC']],
                limit: 1
            }
        ],
        order: [['lastActivity', 'DESC']]
    };

    if (isAdmin) {
        options.where = { adminId: userId };
        options.include.push({
            model: user,
            attributes: ['id', 'fullName', 'email', 'phone']
        });
    } else {
        options.where = { userId };
        options.include.push({
            model: admin,
            attributes: ['id', 'name', 'email']
        });
    }

    return await chatRoom.findAll(options);
}

async function refreshRoomsForParticipants(io, adminId, userId) {
    const adminSocketId = await getAdminSocketId(adminId);
    const userSocketId = await getUserSocketId(userId);

    if (adminSocketId) {
        const adminRooms = await getUserRooms(adminId, true);
        io.to(adminSocketId).emit('adminRooms', { rooms: adminRooms });
    }

    if (userSocketId) {
        const userRooms = await getUserRooms(userId, false);
        io.to(userSocketId).emit('userRooms', { rooms: userRooms });
    }
}

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('setUser', async ({ userId, isAdmin = false }) => {
            try {
                if (userId) {
                    await storeSocketConnection(userId, socket.id, isAdmin);
                    console.log(`${isAdmin ? 'Admin' : 'User'} ${userId} connected with socket id ${socket.id}`);

                    const rooms = await getUserRooms(userId, isAdmin);
                    socket.emit(isAdmin ? 'adminRooms' : 'userRooms', { rooms });
                }
            } catch (err) {
                console.error('Error setting user:', err);
                socket.emit('error', { message: 'Connection error', details: err.message });
            }
        });

        socket.on('adminChatMessage', async ({ message, targetUserId, senderAdminId }) => {
            try {
                const room = await getOrCreateAdminRoom(senderAdminId, targetUserId);
                await storeMessage(room.id, senderAdminId, message, true);

                const targetSocketId = await getUserSocketId(targetUserId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('adminChatMessage', {
                        senderId: senderAdminId,
                        message,
                        isAdmin: true
                    });
                }

                refreshRoomsForParticipants(io, senderAdminId, targetUserId);
            } catch (err) {
                console.error('Admin chat error:', err);
                socket.emit('error', { message: 'Failed to send message', details: err.message });
            }
        });

        socket.on('userChatMessage', async ({ message, targetAdminId, senderUserId }) => {
            try {
                const room = await getOrCreateAdminRoom(targetAdminId, senderUserId);
                await storeMessage(room.id, senderUserId, message, false);

                const targetSocketId = await getAdminSocketId(targetAdminId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('userChatMessage', {
                        senderId: senderUserId,
                        message,
                        isAdmin: false
                    });
                }

                refreshRoomsForParticipants(io, targetAdminId, senderUserId);
            } catch (err) {
                console.error('User chat error:', err);
                socket.emit('error', { message: 'Failed to send message', details: err.message });
            }
        });

        socket.on('disconnect', async () => {
            try {
                await removeSocketConnection(socket.id);
                console.log('User disconnected:', socket.id);
            } catch (err) {
                console.error('Error handling disconnect:', err);
            }
        });
    });
}

module.exports = { initializeSocket };