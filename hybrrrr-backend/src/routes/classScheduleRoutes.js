import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  createClass,
  getAllClasses,
  updateClass,
  deleteClass,
  getMyUpcomingClasses,
} from "../controllers/classScheduleController.js";

const router = express.Router();

// Admin only
router.post("/", protect, requireRole("admin"), createClass);
router.get("/", protect, requireRole("admin"), getAllClasses);
router.patch("/:id", protect, requireRole("admin"), updateClass);
router.delete("/:id", protect, requireRole("admin"), deleteClass);

// Students see their own cohort's upcoming classes
router.get("/upcoming", protect, getMyUpcomingClasses);

export default router;