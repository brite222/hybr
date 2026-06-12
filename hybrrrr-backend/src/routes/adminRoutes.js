import express from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";


import {
  getStats,
  getUsers,
  createUser,
  updateUserTier,
  deleteUser,
  getAssignments,
  createAssignment,
  deleteAssignment,
  getCohorts,
  createCohort,
} from "../controllers/adminController.js";
import { getAnalytics } from "../controllers/analyticsController.js";  // ✅ NEW

const router = express.Router();

// All routes require admin role
router.use(protect, requireRole("admin"));

// ─── DASHBOARD STATS ───
router.get("/stats", getStats);

// ─── ANALYTICS ✅ NEW ───
router.get("/analytics", getAnalytics);

// ─── USERS ───
router.get("/users", getUsers);
router.post("/users", createUser);
router.patch("/users/:id/tier", updateUserTier);
router.delete("/users/:id", deleteUser);

// ─── ASSIGNMENTS ───
router.get("/assignments", getAssignments);
router.post("/assignments", createAssignment);
router.delete("/assignments/:id", deleteAssignment);

// ─── COHORTS ───
router.get("/cohorts", getCohorts);
router.post("/cohorts", createCohort);
// ─── GET ALL COHORTS (with lock settings) ───
router.get("/cohorts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.name, c.start_date, c.total_weeks,
        COALESCE(c.lock_mode, 'auto') AS lock_mode,
        c.max_unlocked_week,
        COUNT(u.id) AS student_count
      FROM cohorts c
      LEFT JOIN users u ON u.cohort_id = c.id AND u.role = 'student'
      GROUP BY c.id
      ORDER BY c.start_date DESC
    `);
    res.json({ cohorts: result.rows });
  } catch (err) {
    console.error("getCohorts error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE COHORT LOCK SETTINGS ───
router.patch("/cohorts/:id/lock", async (req, res) => {
  const { id } = req.params;
  const { lock_mode, max_unlocked_week } = req.body;

  if (!["auto", "manual"].includes(lock_mode)) {
    return res.status(400).json({ message: "lock_mode must be 'auto' or 'manual'" });
  }

  if (lock_mode === "manual") {
    const week = parseInt(max_unlocked_week);
    if (isNaN(week) || week < 1 || week > 8) {
      return res.status(400).json({ message: "max_unlocked_week must be 1-8 in manual mode" });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE cohorts 
       SET lock_mode = $1, 
           max_unlocked_week = $2
       WHERE id = $3
       RETURNING id, name, lock_mode, max_unlocked_week`,
      [
        lock_mode,
        lock_mode === "manual" ? parseInt(max_unlocked_week) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cohort not found" });
    }

    res.json({ message: "Lock settings updated", cohort: result.rows[0] });
  } catch (err) {
    console.error("updateCohortLock error:", err);
    res.status(500).json({ message: err.message });
  }
});
export default router;