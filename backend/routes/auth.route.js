import express from "express";
import { loginAdmin, getMe, logoutAdmin } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginAdmin);
// POST /api/auth/logout
router.post("/logout", protectRoute, logoutAdmin);
// GET /api/auth/me
router.get("/me", protectRoute, getMe);

export default router;
