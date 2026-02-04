import express from "express";
import {
  getAllDrivers,
  createDriver,
  getDriverById,
  updateDriver,
  assignBins,
  deleteDriver,
} from "../controllers/drivers.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import upload from "../config/multer.js";
const router = express.Router();

router.get("/", protectRoute, getAllDrivers);
router.post("/", upload.single("photo"), protectRoute, createDriver);
router.get("/:id", protectRoute, getDriverById);
router.put("/:id", upload.single("photo"), protectRoute, updateDriver);
router.put("/assign/bins", protectRoute, assignBins);
router.delete("/:id", protectRoute, deleteDriver);
export default router;
