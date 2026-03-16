import express from "express";
import {
  addBin,
  getAllBins,
  deleteBin,
  updateBin,
  getBinById,
  getAllUnassignedBins,
  receiveBinData,
  getAssignedBins,
} from "../controllers/bins.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { authenticateDriver } from "../middleware/driverAuth.js";


const router = express.Router();

router.get("/assigned", authenticateDriver, getAssignedBins); // Get bins assigned to authenticated driver

router.post("/add", protectRoute, addBin); // Add bin
router.get("/", protectRoute, getAllBins); // Get all bins
router.get("/unassigned", protectRoute, getAllUnassignedBins); // Get all unassigned bins
router.get("/:id", protectRoute, getBinById); // Get bin by ID
router.delete("/:id", protectRoute, deleteBin); // Delete bin
router.put("/:id", protectRoute, updateBin); // Update bin
router.post("/data", receiveBinData); // Endpoint for receiving bin data from devices

export default router;
