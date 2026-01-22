import express from "express";
import { getAllDrivers } from "../controllers/drivers.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();

router.get("/", protectRoute, getAllDrivers);

export default router;
