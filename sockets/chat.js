

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('setUser', async ({ userId, socketId, isAdmin = false }) => {
            try {
                if (userId) {
                    await storeSocketConnection(userId, socketId, isAdmin);
                    console.log(`${isAdmin ? 'Admin' : 'User'} ${userId} connected with socket id ${socket.id}`);

                    const rooms = await getUserRooms(userId, isAdmin);
                    io.to(socketId).emit('userRooms', { rooms });
                }
            } catch (err) {
                console.error('Error setting user:', err);
                socket.emit('error', { message: 'Connection error' });
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

                    refreshRoomsForParticipants(io, senderAdminId, targetUserId);
                }
            } catch (err) {
                console.error('Admin chat error:', err);
                socket.emit('error', { message: 'Failed to send message' });
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

                    refreshRoomsForParticipants(io, targetAdminId, senderUserId);
                }
            } catch (err) {
                console.error('User chat error:', err);
                socket.emit('error', { message: 'Failed to send message' });
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