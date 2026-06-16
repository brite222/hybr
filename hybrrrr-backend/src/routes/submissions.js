import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import { newSubmissionTemplate } from "../utils/emailTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Ensure upload folder exists ──
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "submissions");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer config ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${req.user.id}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});

// ─────────────────────────────────────────────
// POST /api/submissions  → student uploads PDF
// ─────────────────────────────────────────────
router.post(
  "/",
  protect,
  requireRole("student"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { weekNumber, lessonId } = req.body;

      const result = await pool.query(
        `INSERT INTO submissions
           (student_id, week_number, lesson_id, file_name, file_path, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          req.user.id,
          weekNumber || 1,
          lessonId || "workplan",
          req.file.originalname,
          req.file.filename,
          req.file.size,
        ]
      );

      // ✅ NOTIFY COACH VIA EMAIL
      try {
        const coachInfo = await pool.query(`
          SELECT c.first_name AS coach_first, c.email AS coach_email,
                 s.first_name AS student_first, s.last_name AS student_last
          FROM coach_student_assignments a
          JOIN users c ON c.id = a.coach_id
          JOIN users s ON s.id = a.student_id
          WHERE a.student_id = $1
        `, [req.user.id]);

        if (coachInfo.rows[0]?.coach_email) {
          await sendEmail({
            to: coachInfo.rows[0].coach_email,
            subject: ` New submission from ${coachInfo.rows[0].student_first}`,
            html: newSubmissionTemplate({
              coachName: coachInfo.rows[0].coach_first,
              studentName: `${coachInfo.rows[0].student_first} ${coachInfo.rows[0].student_last}`,
              weekNumber: weekNumber || 1,
              lessonTitle: "Work Assignment",
            }),
          });
          console.log(`✅ Coach notification email sent`);
        }
      } catch (emailErr) {
        console.error("Coach email failed:", emailErr.message);
      }

      res.json({ success: true, submission: result.rows[0] });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// ─────────────────────────────────────────────
// GET /api/submissions/me  → student's own
// ─────────────────────────────────────────────
router.get("/me", protect, requireRole("student"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM submissions WHERE student_id = $1 ORDER BY submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/submissions/coach  → coach sees their students
// ─────────────────────────────────────────────
router.get("/coach", protect, requireRole("coach"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email
         FROM submissions s
         JOIN users u ON s.student_id = u.id
         JOIN coach_student_assignments a ON a.student_id = s.student_id
        WHERE a.coach_id = $1
        ORDER BY s.submitted_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/submissions/admin  → admin sees all
// ─────────────────────────────────────────────
router.get("/admin", protect, requireRole("admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email
         FROM submissions s
         JOIN users u ON s.student_id = u.id
        ORDER BY s.submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/submissions/file/:filename  → download
// ─────────────────────────────────────────────
router.get("/file/:filename", protect, async (req, res) => {
  try {
    const { filename } = req.params;

    const result = await pool.query(
      `SELECT s.*, a.coach_id
         FROM submissions s
         LEFT JOIN coach_student_assignments a ON a.student_id = s.student_id
        WHERE s.file_path = $1`,
      [filename]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Submission not found in database" });
    }
    const sub = result.rows[0];

    // Permission check
    const allowed =
      req.user.role === "admin" ||
      req.user.id === sub.student_id ||
      (req.user.role === "coach" && req.user.id === sub.coach_id);

    if (!allowed) return res.status(403).json({ message: "Forbidden" });

    // Check if file actually exists on disk
    const filePath = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({
        message: "File not found on disk. The file may have been deleted or never uploaded.",
      });
    }

    res.download(filePath, sub.file_name);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;