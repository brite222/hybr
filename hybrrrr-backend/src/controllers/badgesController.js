import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import { badgeEarnedTemplate } from "../utils/emailTemplates.js";

// ─── HELPER: Check & award badges ───
export async function checkAndAwardBadges(userId) {
  try {
    // Get user's current stats
    const statsResult = await pool.query(`
      SELECT 
        u.total_points,
        (SELECT COUNT(DISTINCT lesson_id) FROM lesson_progress WHERE user_id = u.id) AS lessons_done,
        (SELECT COUNT(*) FROM submissions WHERE student_id = u.id) AS submissions_count,
        (SELECT COUNT(*) FROM quiz_attempts WHERE student_id = u.id AND percent >= 90) AS quiz_90plus,
        (SELECT COUNT(DISTINCT week_number) FROM lesson_progress WHERE user_id = u.id) AS weeks_active
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (statsResult.rows.length === 0) return [];
    const stats = statsResult.rows[0];

    // Per-week completion
    const weekCompletionsResult = await pool.query(`
      SELECT week_number, COUNT(DISTINCT lesson_id) AS done
      FROM lesson_progress
      WHERE user_id = $1
      GROUP BY week_number
    `, [userId]);

    const weekDone = {};
    weekCompletionsResult.rows.forEach(r => {
      weekDone[r.week_number] = parseInt(r.done);
    });

    // Lesson types completed
    const typesResult = await pool.query(`
      SELECT DISTINCT lesson_id 
      FROM lesson_progress 
      WHERE user_id = $1
    `, [userId]);
    const completedIds = typesResult.rows.map(r => r.lesson_id);
    const hasVideo = completedIds.some(id => id.includes("video") || id.includes("webinar"));
    const hasAudio = completedIds.some(id => id.includes("audio"));

    // Top grade
    const gradeResult = await pool.query(`
      SELECT MAX(
        ((COALESCE(criterion_1,0) + COALESCE(criterion_2,0) + COALESCE(criterion_3,0) + 
          COALESCE(criterion_4,0) + COALESCE(criterion_5,0))::float / 25) * 100
      ) AS top_grade
      FROM submission_grades g
      JOIN submissions s ON s.id = g.submission_id
      WHERE s.student_id = $1
    `, [userId]);
    const topGrade = gradeResult.rows[0]?.top_grade || 0;

    // Define badges to award
    const badgesToAward = [];

    if (stats.lessons_done >= 1) badgesToAward.push("first_steps");
    if (stats.quiz_90plus >= 1) badgesToAward.push("quiz_master");
    if (weekDone[1] >= 5) badgesToAward.push("week_one");
    if (weekDone[2] >= 8) badgesToAward.push("week_two");
    if (weekDone[3] >= 8) badgesToAward.push("week_three");
    if (Object.values(weekDone).filter(c => c > 0).length >= 4) badgesToAward.push("halfway");
    if (stats.total_points >= 100) badgesToAward.push("points_100");
    if (stats.total_points >= 250) badgesToAward.push("points_250");
    if (stats.total_points >= 500) badgesToAward.push("points_500");
    if (stats.total_points >= 1000) badgesToAward.push("points_1000");
    if (stats.submissions_count >= 1) badgesToAward.push("upload_first");
    if (hasVideo) badgesToAward.push("video_watcher");
    if (hasAudio) badgesToAward.push("audio_listener");
    if (topGrade >= 90) badgesToAward.push("grade_a");
    if (stats.weeks_active >= 8) badgesToAward.push("demo_day");

    // Award new badges + send email
    const newlyEarned = [];
    for (const code of badgesToAward) {
      const result = await pool.query(`
        INSERT INTO user_badges (user_id, badge_id)
        SELECT $1, id FROM badges WHERE code = $2
        ON CONFLICT (user_id, badge_id) DO NOTHING
        RETURNING badge_id
      `, [userId, code]);

      if (result.rows.length > 0) {
        const badge = await pool.query("SELECT * FROM badges WHERE code = $1", [code]);
        if (badge.rows[0]) {
          newlyEarned.push(badge.rows[0]);

          // ✅ SEND BADGE EMAIL
          try {
            const userInfo = await pool.query(
              "SELECT first_name, email FROM users WHERE id = $1",
              [userId]
            );
            const totalBadges = await pool.query(
              "SELECT COUNT(*) AS count FROM user_badges WHERE user_id = $1",
              [userId]
            );

            if (userInfo.rows[0]?.email) {
              await sendEmail({
                to: userInfo.rows[0].email,
                subject: ` You earned a new badge: ${badge.rows[0].name}!`,
                html: badgeEarnedTemplate({
                  firstName: userInfo.rows[0].first_name,
                  badgeName: badge.rows[0].name,
                  badgeDescription: badge.rows[0].description,
                  badgeIcon: badge.rows[0].icon,
                  totalBadges: parseInt(totalBadges.rows[0].count),
                }),
              });
              console.log(`✅ Badge email sent for: ${code}`);
            }
          } catch (emailErr) {
            console.error("Badge email failed:", emailErr.message);
          }
        }
      }
    }

    return newlyEarned;
  } catch (err) {
    console.error("checkAndAwardBadges error:", err);
    return [];
  }
}

// ─── GET /api/badges/me ───
export const getMyBadges = async (req, res) => {
  try {
    const earnedResult = await pool.query(`
      SELECT b.*, ub.earned_at
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = $1
      ORDER BY ub.earned_at DESC
    `, [req.userId]);

    const allResult = await pool.query("SELECT * FROM badges ORDER BY id");

    const earnedIds = new Set(earnedResult.rows.map(b => b.id));
    const locked = allResult.rows.filter(b => !earnedIds.has(b.id));

    res.json({
      earned: earnedResult.rows,
      locked,
      total: allResult.rows.length,
      earned_count: earnedResult.rows.length,
    });
  } catch (err) {
    console.error("getMyBadges error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/badges/check ───
export const checkBadges = async (req, res) => {
  try {
    const newlyEarned = await checkAndAwardBadges(req.userId);
    res.json({ newlyEarned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};