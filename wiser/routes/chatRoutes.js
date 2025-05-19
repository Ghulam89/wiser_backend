// const express = require("express");
// const router = express.Router();
// const chatController = require("../controller/chatController");
// const { authenticate, authorize } = require("../middleware/authMiddleware");

// // User routes
// router.get("/user/rooms/:userId", authenticate, chatController.getUserRooms);
// router.get("/user/unread/:userId", authenticate, chatController.getUserUnreadCount);

// // Admin routes
// router.get("/admin/rooms/:adminId", authenticate, authorize(['Admin Staff', 'Super Admin']), chatController.getAdminRooms);
// router.get("/admin/unread/:adminId", authenticate, authorize(['Admin Staff', 'Super Admin']), chatController.getAdminUnreadCount);

// // Common routes
// router.get("/room/:adminId/:userId", authenticate, chatController.getOrCreateRoom);
// router.get("/room/messages/:roomId", authenticate, chatController.getRoomMessages);
// router.put("/room/mark-read/:roomId/:userId", authenticate, chatController.markMessagesAsRead);

// module.exports = router;



const express = require("express");
const router = express.Router();
const chatController = require("../controller/chatController");

// User routes
router.get("/user/rooms/:userId", chatController.getUserRooms);
router.get("/user/unread/:userId",  chatController.getUserUnreadCount);

// Admin routes
router.get("/admin/rooms/:adminId", chatController.getAdminRooms);
router.get("/admin/unread/:adminId", chatController.getAdminUnreadCount);

// Common routes
router.get("/room/:adminId/:userId",  chatController.getOrCreateRoom);
router.get("/room/messages/:roomId", chatController.getRoomMessages);
router.put("/room/mark-read/:roomId/:userId",chatController.markMessagesAsRead);

module.exports = router;