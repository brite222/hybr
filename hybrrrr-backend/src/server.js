import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import coachRoutes from "./routes/coachRoutes.js";
import programRoutes from "./routes/programRoutes.js";   
import submissionsRoutes from "./routes/submissions.js"
import quizRoutes from "./routes/quizRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pointsRoutes from "./routes/pointsRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import badgesRoutes from "./routes/badgesRoutes.js";
import classScheduleRoutes from "./routes/classScheduleRoutes.js";   
import notificationsRoutes from "./routes/notificationsRoutes.js";   
import { startClassReminderJob } from "./jobs/classReminders.js";    

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    process.env.FRONTEND_URL,  
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/program", programRoutes);   
app.use("/api/submissions", submissionsRoutes);  
app.use("/api/quiz", quizRoutes);
app.use("/api/users", userRoutes);
app.use("/api/points", pointsRoutes); 
app.use("/api", contentRoutes);
app.use("/api/badges", badgesRoutes);
app.use("/api/classes", classScheduleRoutes);        
app.use("/api/notifications", notificationsRoutes);   

app.get("/", (req, res) => {
  res.json({ message: "ALPHA Backend API is running 🚀" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  startClassReminderJob();  // ✅ NEW — start the cron job
});