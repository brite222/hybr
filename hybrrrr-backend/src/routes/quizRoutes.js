import express from "express";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/quiz/submit  → student submits quiz
// ─────────────────────────────────────────────
router.post("/submit", protect, requireRole("student"), async (req, res) => {
  try {
    const { weekNumber, lessonId, score, totalQs, percent, answers } = req.body;

    if (
      weekNumber === undefined ||
      !lessonId ||
      score === undefined ||
      !totalQs ||
      percent === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find attempt number
    const prior = await pool.query(
      `SELECT COUNT(*) FROM quiz_attempts WHERE student_id = $1 AND lesson_id = $2`,
      [req.user.id, lessonId]
    );
    const attemptNumber = parseInt(prior.rows[0].count, 10) + 1;

    const result = await pool.query(
      `INSERT INTO quiz_attempts
         (student_id, week_number, lesson_id, score, total_questions, percent, answers, attempt_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        weekNumber,
        lessonId,
        score,
        totalQs,
        percent,
        JSON.stringify(answers || {}),
        attemptNumber,
      ]
    );

    res.json({ success: true, attempt: result.rows[0] });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/quiz/me  → student's own attempts
// ─────────────────────────────────────────────
router.get("/me", protect, requireRole("student"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM quiz_attempts WHERE student_id = $1 ORDER BY submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/quiz/coach  → coach sees their students
// ─────────────────────────────────────────────
router.get("/coach", protect, requireRole("coach"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, u.first_name, u.last_name, u.email
         FROM quiz_attempts q
         JOIN users u ON q.student_id = u.id
         JOIN coach_student_assignments a ON a.student_id = q.student_id
        WHERE a.coach_id = $1
        ORDER BY q.submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/quiz/admin  → admin sees all
// ─────────────────────────────────────────────
router.get("/admin", protect, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT q.*, u.first_name, u.last_name, u.email
         FROM quiz_attempts q
         JOIN users u ON q.student_id = u.id
        ORDER BY q.submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;