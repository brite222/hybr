import pool from "../config/db.js";
import { checkAndAwardBadges } from "./badgesController.js";

// ── Points configuration ──
const POINTS_CONFIG = {
  module: 5,
  image: 5,
  video: 3,         // ✅ updated from 15 → 3
  audio: 1,         // ✅ updated from 15 → 1
  download: 5,
  upload: 3,        // ✅ updated from 25 → 3
  quiz: 5,          // base, plus bonus per correct answer
  info: 5,
  feedback: 3,      // ✅ updated from 10 → 3
};

// ── Survey bonus (only applies to feedback lessons) ──
const SURVEY_BONUS = 3;

// ── Helper: Award points + Mark lesson complete + Check badges ──
async function awardPoints(userId, lessonId, weekNumber, points, reason) {
  try {
    // Insert points log entry
    await pool.query(
      `
      INSERT INTO points_log (user_id, lesson_id, week_number, points, reason)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, lesson_id, reason) DO NOTHING
      `,
      [userId, lessonId, weekNumber, points, reason]
    );

    // Mark the lesson as complete in lesson_progress
    await pool.query(
      `
      INSERT INTO lesson_progress (user_id, week_number, lesson_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, lesson_id) DO NOTHING
      `,
      [userId, weekNumber, lessonId]
    );

    // Update user's cached total points
    await pool.query(
      `
      UPDATE users 
      SET total_points = (
        SELECT COALESCE(SUM(points), 0) FROM points_log WHERE user_id = $1
      )
      WHERE id = $1
      `,
      [userId]
    );

    // Check and auto-award badges
    await checkAndAwardBadges(userId);

    return true;
  } catch (err) {
    console.error("awardPoints error:", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/points/award
// Body: { lessonId, weekNumber, lessonType, extra? }
//   extra examples:
//     - quiz:     { correctAnswers: 4 }
//     - feedback: { surveyCompleted: true | false }
// ─────────────────────────────────────────────────────────────
export const awardLessonPoints = async (req, res) => {
  const { lessonId, weekNumber, lessonType, extra } = req.body;

  if (!lessonId || !lessonType) {
    return res.status(400).json({ message: "lessonId and lessonType required" });
  }

  const basePoints = POINTS_CONFIG[lessonType] || 5;
  let reason = `Completed ${lessonType} lesson`;

  try {
    // ─── 1) Award the base lesson points ───
    let basePointsAwarded = basePoints;

    // Quiz bonus: extra points per correct answer
    if (lessonType === "quiz" && extra?.correctAnswers) {
      basePointsAwarded = basePoints + extra.correctAnswers * 5;
      reason = `Quiz: ${extra.correctAnswers} correct answers`;
    }

    await awardPoints(req.userId, lessonId, weekNumber, basePointsAwarded, reason);

    let totalPointsAwarded = basePointsAwarded;
    let surveyBonusAwarded = 0;

    // ─── 2) Survey bonus (feedback lessons only) ───
    if (lessonType === "feedback" && extra?.surveyCompleted === true) {
      const surveyReason = `Survey completed for ${lessonId}`;
      await awardPoints(
        req.userId,
        lessonId,
        weekNumber,
        SURVEY_BONUS,
        surveyReason
      );
      surveyBonusAwarded = SURVEY_BONUS;
      totalPointsAwarded += SURVEY_BONUS;
    }

    // ─── 3) Get newly earned badges (if any) ───
    const newBadges = await checkAndAwardBadges(req.userId);

    // ─── 4) Get updated total ───
    const totalResult = await pool.query(
      "SELECT total_points FROM users WHERE id = $1",
      [req.userId]
    );

    res.json({
      success: true,
      pointsEarned: totalPointsAwarded,
      basePoints: basePointsAwarded,
      surveyBonus: surveyBonusAwarded,
      totalPoints: totalResult.rows[0]?.total_points || 0,
      reason,
      newBadges,
    });
  } catch (err) {
    console.error("awardLessonPoints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/points/me  (student sees their points + breakdown)
// ─────────────────────────────────────────────────────────────
export const getMyPoints = async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT total_points FROM users WHERE id = $1",
      [req.userId]
    );

    const weeklyResult = await pool.query(
      `
      SELECT 
        week_number,
        SUM(points) AS week_points,
        COUNT(*) AS activities
      FROM points_log 
      WHERE user_id = $1
      GROUP BY week_number
      ORDER BY week_number
      `,
      [req.userId]
    );

    const recentResult = await pool.query(
      `
      SELECT lesson_id, week_number, points, reason, earned_at
      FROM points_log 
      WHERE user_id = $1
      ORDER BY earned_at DESC
      LIMIT 20
      `,
      [req.userId]
    );

    res.json({
      total: totalResult.rows[0]?.total_points || 0,
      by_week: weeklyResult.rows,
      recent: recentResult.rows,
    });
  } catch (err) {
    console.error("getMyPoints error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/points/leaderboard  (top 20 students)
// ─────────────────────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.tier, 
        u.profile_picture,
        u.total_points,
        (SELECT COUNT(DISTINCT lesson_id) FROM lesson_progress WHERE user_id = u.id) AS lessons_completed,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badges_count
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.total_points DESC NULLS LAST, lessons_completed DESC
      LIMIT 20
    `);

    res.json({ leaderboard: result.rows });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    res.status(500).json({ message: err.message });
  }
};