import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { 
  getMyStudents, 
  getStudentDetails,
  getGradingQueue,
  gradeSubmission,
  getDashboardStats,
} from "../controllers/coachController.js";

const router = express.Router();

router.use(protect, requireRole("coach"));

router.get("/stats", getDashboardStats);
router.get("/students", getMyStudents);
router.get("/students/:id", getStudentDetails);
router.get("/grading", getGradingQueue);
router.post("/grading/:submissionId", gradeSubmission);

export default router;