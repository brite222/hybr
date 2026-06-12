import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getMyBadges, checkBadges } from "../controllers/badgesController.js";

const router = express.Router();

router.get("/me", protect, requireRole("student"), getMyBadges);
router.post("/check", protect, requireRole("student"), checkBadges);

export default router;