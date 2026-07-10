import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { 
  getContent, 
  getAllContent, 
  upsertContent, 
  deleteContent 
} from "../controllers/contentController.js";

const router = express.Router();

// ─── CLOUDINARY CONFIG ───
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── MEDIA UPLOAD CONFIG ───
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "alpha-content",
    resource_type: "auto", // handles video, image, raw (pdf), etc.
    public_id: (req, file) => {
      const safe = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
      return `${Date.now()}-${safe}`;
    },
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
      url: req.file.path, // ✅ Cloudinary's hosted URL
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  }
);

export default router;