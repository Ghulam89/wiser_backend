const db = require("../models/index.js");
const { Op } = require("sequelize");

const chatController = {
    // User endpoints
    getUserRooms: async (req, res) => {
        try {
            const { userId } = req.params;
            const rooms = await db.chatRoom.findAll({
                where: { userId },
                include: [
                    {
                        model: db.admin,
                        as: 'admin',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: db.chatMessage,
                        as: 'messages',
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    }
                ],
                order: [['lastActivity', 'DESC']]
            });
            res.json({ data: rooms });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUserUnreadCount: async (req, res) => {
        try {
            const { userId } = req.params;
            const rooms = await db.chatRoom.findAll({
                where: { userId },
                attributes: ['id']
            });
            
            const roomIds = rooms.map(room => room.id);
            
            const unreadCount = await db.chatMessage.count({
                where: {
                    roomId: { [Op.in]: roomIds },
                    isAdmin: true,
                    isRead: false
                }
            });
            
            res.json({ data: { unreadCount } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Admin endpoints
    getAdminRooms: async (req, res) => {
        try {
            const { adminId } = req.params;
            const rooms = await db.chatRoom.findAll({
                where: { adminId },
                include: [
                    {
                        model: db.user,
                        as: 'user',
                        attributes: ['id', 'fullName', 'email', 'phone']
                    },
                    {
                        model: db.chatMessage,
                        as: 'messages',
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    }
                ],
                order: [['lastActivity', 'DESC']]
            });
            res.json({ data: rooms });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getAdminUnreadCount: async (req, res) => {
        try {
            const { adminId } = req.params;
            const rooms = await db.chatRoom.findAll({
                where: { adminId },
                attributes: ['id']
            });
            
            const roomIds = rooms.map(room => room.id);
            
            const unreadCount = await db.chatMessage.count({
                where: {
                    roomId: { [Op.in]: roomIds },
                    isAdmin: false,
                    isRead: false
                }
            });
            
            res.json({ data: { unreadCount } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Common endpoints
    getOrCreateRoom: async (req, res) => {
        try {
            const { adminId, userId } = req.params;
            const [room] = await db.chatRoom.findOrCreate({
                where: { adminId, userId },
                defaults: {
                    adminId,
                    userId,
                    lastActivity: new Date()
                }
            });
            res.json({ data: room });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getRoomMessages: async (req, res) => {

        try {
            
            const { roomId } = req.params;
            const messages = await db.chatMessage.findAll({
                where: { roomId },
                order: [['createdAt', 'ASC']]
            });
            res.json({ data: messages });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    markMessagesAsRead: async (req, res) => {
        try {
            const { roomId, userId } = req.params;
            
            // Determine if the user is an admin or regular user
            const room = await db.chatRoom.findOne({
                where: { id: roomId, [Op.or]: [{ userId }, { adminId: userId }] }
            });
            
            if (!room) {
                return res.status(404).json({ error: "Room not found" });
            }
            
            const isAdmin = room.adminId === userId;
            
            await db.chatMessage.update(
                { isRead: true },
                {
                    where: {
                        roomId,
                        isAdmin: !isAdmin,
                        isRead: false
                    }
                }
            );
            
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = chatController;