import express from "express";
import {
  getAllDrivers,
  createDriver,
  getDriverById,
  updateDriver,
  assignBins,
  deleteDriver,
  loginDriver,
  driverHome,
  logoutDriver,
  driverForgotPassword,
  driverResetPassword,
  validateDriverResetToken,
  getDriverPerformance,
} from "../controllers/drivers.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { authenticateDriver } from "../middleware/driverAuth.js";
import upload from "../config/multer.js";
const router = express.Router();

router.post("/login", loginDriver);
router.post("/logout", authenticateDriver, logoutDriver);
router.get("/home", authenticateDriver, driverHome);
router.post("/forgot-password", driverForgotPassword);
router.post("/reset-password/:token", driverResetPassword);
router.get("/validate-reset-token/:token", validateDriverResetToken);

router.get("/", protectRoute, getAllDrivers);
router.post("/", upload.single("photo"), protectRoute, createDriver);
router.get("/:id/performance", protectRoute, getDriverPerformance);
router.get("/:id", protectRoute, getDriverById);
router.put("/:id", upload.single("photo"), protectRoute, updateDriver);
router.put("/assign/bins", protectRoute, assignBins);
router.delete("/:id", protectRoute, deleteDriver);
export default router;
