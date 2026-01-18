import express from "express";
import { loginAdmin, getMe, logoutAdmin, forgotPassword, resetPassword, validateResetToken } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", loginAdmin);
// POST /api/auth/logout
router.post("/logout", protectRoute, logoutAdmin);
// GET /api/auth/me
router.get("/me", protectRoute, getMe);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/validate-reset-token/:token", validateResetToken);
export default router;