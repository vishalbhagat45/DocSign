// routes/activityRoutes.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getAllActivities } from "../controllers/activityController.js";

const router = express.Router();

//  Use verifyToken instead of protect
router.get("/", verifyToken, getAllActivities);

export default router;
