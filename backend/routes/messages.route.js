import express from "express";
import {
  getMessages,
  sendMessage,
  getConversations,
  getDriverConversations,
  markMessagesAsRead,
  searchDrivers,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { authenticateDriver } from "../middleware/driverAuth.js";

const router = express.Router();

// Admin search drivers to compose message
router.get("/search-drivers", protectRoute, searchDrivers);
// Admin get list of conversations
router.get("/conversations", protectRoute, getConversations);
// Driver get list of conversations
router.get("/driver-conversations", authenticateDriver, getDriverConversations);
// Admin fetch messages
router.get("/admin", protectRoute, getMessages);

// Driver fetch messages
router.get("/driver", authenticateDriver, getMessages);


router.post("/admin", protectRoute, sendMessage);
router.post("/driver", authenticateDriver, sendMessage);

// Mark messages as read
router.put("/mark-read", protectRoute, markMessagesAsRead);

export default router;
