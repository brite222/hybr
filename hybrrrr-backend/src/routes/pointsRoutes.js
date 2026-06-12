import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { 
  awardLessonPoints, 
  getMyPoints, 
  getLeaderboard 
} from "../controllers/pointsController.js";

const router = express.Router();

// Students award themselves points (when they complete a lesson)
router.post("/award", protect, requireRole("student"), awardLessonPoints);

// Student sees their own points
router.get("/me", protect, requireRole("student"), getMyPoints);

// Anyone authenticated can see leaderboard
router.get("/leaderboard", protect, getLeaderboard);

export default router;