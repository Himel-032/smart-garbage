import express from "express";
import {
  addBin,
  getAllBins,
  deleteBin,
  updateBin,
  getBinById,
} from "../controllers/bins.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = express.Router();

router.post("/add", protectRoute, addBin); // Add bin
router.get("/", protectRoute, getAllBins); // Get all bins
router.get("/:id", protectRoute, getBinById); // Get bin by ID
router.delete("/:id", protectRoute, deleteBin); // Delete bin
router.put("/:id", protectRoute, updateBin); // Update bin

export default router;
