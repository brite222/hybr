import express from "express";
import {
  register, login, verifyEmail, forgotPassword, resetPassword, getMe,
  changePassword,   // ✅ added
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePassword);   
router.get("/analytics", getAnalytics);
export default router;