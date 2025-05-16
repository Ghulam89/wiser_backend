const db = require("../models/index.js");
const { Op } = require("sequelize");
// Helper function to get user socket ID
async function getUserSocketId(userId) {
  // Implement your logic to get socket ID from your storage
}

// Helper function to get admin socket ID
async function getAdminSocketId(adminId) {
  // Implement your logic to get socket ID from your storage
}

// Get or create a chat room between admin and user
exports.getOrCreateRoom = async (req, res) => {
  try {
    const { adminId, userId } = req.params;

    let room = await db.chatRoom.findOne({
      where: {
        adminId,
        userId
      }
    });

    if (!room) {
      room = await db.chatRoom.create({
        adminId,
        userId,
        lastActivity: new Date()
      });
    }

    res.status(200).json({
      status: "success",
      data: room
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get or create chat room"
    });
  }
};

// Get all messages in a room
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await db.chatMessage.findAll({
      where: { roomId },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      status: "success",
      data: messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get room messages"
    });
  }
};

// Get all rooms for a user
exports.getUserRooms = async (req, res) => {
  try {
    const { userId } = req.params;

    const rooms = await db.chatRoom.findAll({
      where: { userId },
      include: [
        {
          model: db.admin,
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.chatMessage,
          as: 'messages',
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    res.status(200).json({
      status: "success",
      data: rooms
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get user rooms"
    });
  }
};

// Get all rooms for an admin
exports.getAdminRooms = async (req, res) => {
  try {
    const { adminId } = req.params;

    const rooms = await db.chatRoom.findAll({
      where: { adminId },
      include: [
        {
          model: db.user,
          attributes: ['id', 'fullName', 'email', 'phone']
        },
        {
          model: db.chatMessage,
          as: 'messages',
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ],
      order: [['lastActivity', 'DESC']]
    });

    res.status(200).json({
      status: "success",
      data: rooms
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get admin rooms"
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { roomId, userId } = req.params;

    await db.chatMessage.update(
      { isRead: true },
      {
        where: {
          roomId,
          isAdmin: false,
          isRead: false
        }
      }
    );

    res.status(200).json({
      status: "success",
      message: "Messages marked as read"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to mark messages as read"
    });
  }
};

// Get unread message count for admin
exports.getAdminUnreadCount = async (req, res) => {
  try {
    const { adminId } = req.params;

    const rooms = await db.chatRoom.findAll({
      where: { adminId },
      include: [
        {
          model: db.chatMessage,
          as: 'messages',
          where: {
            isAdmin: false,
            isRead: false
          },
          required: false
        }
      ]
    });

    let totalUnread = 0;
    rooms.forEach(room => {
      totalUnread += room.messages.length;
    });

    res.status(200).json({
      status: "success",
      data: { unreadCount: totalUnread }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get unread count"
    });
  }
};

// Get unread message count for user
exports.getUserUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const rooms = await db.chatRoom.findAll({
      where: { userId },
      include: [
        {
          model: db.chatMessage,
          as: 'messages',
          where: {
            isAdmin: true,
            isRead: false
          },
          required: false
        }
      ]
    });

    let totalUnread = 0;
    rooms.forEach(room => {
      totalUnread += room.messages.length;
    });

    res.status(200).json({
      status: "success",
      data: { unreadCount: totalUnread }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to get unread count"
    });
  }
};