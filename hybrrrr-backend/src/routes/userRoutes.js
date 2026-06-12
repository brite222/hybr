import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup uploads/profiles folder
const PROFILE_DIR = path.join(__dirname, "..", "..", "uploads", "profiles");
fs.mkdirSync(PROFILE_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  },
});

// ─── UPLOAD PROFILE PICTURE ───
router.post("/profile-picture", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Update user record
    const result = await pool.query(
      "UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING profile_picture",
      [req.file.filename, req.user.id]
    );

    res.json({ 
      message: "Profile picture updated",
      profile_picture: result.rows[0].profile_picture,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ─── SERVE PROFILE PICTURE ───
router.get("/profile-picture/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(PROFILE_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Image not found" });
  }
  
  res.sendFile(filePath);
});
// ─── UPDATE PROFILE (first/last name) ───
router.patch("/me", protect, async (req, res) => {
  const { firstName, lastName } = req.body;
  
  if (!firstName || !lastName) {
    return res.status(400).json({ message: "First and last name required" });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, email, first_name, last_name, role, tier, profile_picture`,
      [firstName, lastName, req.user.id]
    );

    const u = result.rows[0];
    res.json({
      message: "Profile updated",
      user: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        tier: u.tier,
        profilePicture: u.profile_picture,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
});
export default router;