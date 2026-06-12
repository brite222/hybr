import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getProgram, getWeek, completeLesson, getMyProgress,
  getWeekLessons, getMyGrades,  
} from "../controllers/programController.js";

const router = express.Router();

router.use(protect, requireRole("student"));

router.get("/", getProgram);
router.get("/week/:weekNumber", getWeek);
router.get("/week/:weekNumber/lessons", getWeekLessons);  // ✅ NEW
router.post("/complete", completeLesson);
router.get("/progress", getMyProgress);
router.get("/my-grades", getMyGrades);
export default router;