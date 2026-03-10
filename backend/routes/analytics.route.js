import express from "express";
import {
  getBinAnalytics,
  getAllBinsAnalytics,
  getTopBinsAnalytics,
} from "../controllers/analytics.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

/**
 * @route   GET /api/analytics/bin/:binId
 * @desc    Get daily/weekly/monthly analytics for a single bin
 * @query   range=daily|weekly|monthly (default=daily)
 */
router.get("/bin/:binId", protectRoute, getBinAnalytics);

/**
 * @route   GET /api/analytics/bins
 * @desc    Get daily/weekly/monthly analytics for all bins combined
 * @query   range=daily|weekly|monthly (default=daily)
 */
router.get("/bins", protectRoute, getAllBinsAnalytics);

/**
 * @route   GET /api/analytics/top
 * @desc    Get top N bins by average fill level
 * @query   top=5 (default=5)
 */
router.get("/top", protectRoute, getTopBinsAnalytics);

export default router;
