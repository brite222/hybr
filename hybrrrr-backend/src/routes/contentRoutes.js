import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { 
  getContent, 
  getAllContent, 
  upsertContent, 
  deleteContent 
} from "../controllers/contentController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ─── MEDIA UPLOAD CONFIG ───
const MEDIA_DIR = path.join(__dirname, "..", "..", "uploads", "content");
fs.mkdirSync(MEDIA_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["video/", "audio/", "image/", "application/pdf"];
    if (!allowed.some(type => file.mimetype.startsWith(type))) {
      return cb(new Error("Only video, audio, image, or PDF files allowed"));
    }
    cb(null, true);
  },
});

// ═══════════════════════════════════════════════════════════
// ✅ PUBLIC ROUTE — Serve media files (NO AUTH REQUIRED)
// MUST BE FIRST so it's not blocked by other middleware
// ═══════════════════════════════════════════════════════════
router.get("/content/media/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(MEDIA_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found" });
  }
  
  // ✅ Set proper headers for video/audio streaming
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
  };
  
  if (mimeTypes[ext]) {
    res.setHeader("Content-Type", mimeTypes[ext]);
  }
  
  res.sendFile(filePath);
});

// ─── PROTECTED — students/coaches/admins ───
router.get("/content/:weekNumber/:lessonId", protect, getContent);

// ─── ADMIN ONLY ───
router.get("/admin/content", protect, requireRole("admin"), getAllContent);
router.post("/admin/content", protect, requireRole("admin"), upsertContent);
router.delete("/admin/content/:weekNumber/:lessonId", protect, requireRole("admin"), deleteContent);

// ─── ADMIN UPLOAD ───
router.post(
  "/admin/content/upload",
  protect,
  requireRole("admin"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/api/content/media/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  }
);

export default router;