import pool from "../config/db.js";

// ─── GET /api/admin/analytics ─── (everything in one call)
export const getAnalytics = async (req, res) => {
  try {
    // ── 1. OVERVIEW STATS ──
    const overview = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'coach') AS total_coaches,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND tier = 'premium') AS premium_students,
        (SELECT COUNT(*) FROM users WHERE role = 'student' AND (tier = 'standard' OR tier IS NULL)) AS standard_students,
        (SELECT COUNT(*) FROM submissions) AS total_submissions,
        (SELECT COUNT(*) FROM submission_grades) AS graded_count,
        (SELECT COUNT(*) FROM submissions) - (SELECT COUNT(*) FROM submission_grades) AS ungraded_count,
        (SELECT COUNT(*) FROM lesson_progress) AS total_lessons_completed,
        (SELECT COUNT(*) FROM quiz_attempts) AS total_quiz_attempts,
        (SELECT COUNT(*) FROM user_badges) AS total_badges_awarded,
        (SELECT COALESCE(SUM(total_points), 0) FROM users WHERE role = 'student') AS total_points_earned,
        (SELECT COUNT(*) FROM cohorts WHERE is_active = TRUE) AS active_cohorts
    `);

    // ── 2. TOP 10 STUDENTS BY POINTS ──
    const topStudents = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.tier, u.total_points,
        (SELECT COUNT(DISTINCT lesson_id) FROM lesson_progress WHERE user_id = u.id) AS lessons_done,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = u.id) AS badges
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.total_points DESC NULLS LAST
      LIMIT 10
    `);

    // ── 3. WEEKLY ENGAGEMENT (lessons completed per week) ──
    const weeklyEngagement = await pool.query(`
      SELECT 
        week_number,
        COUNT(DISTINCT user_id) AS unique_students,
        COUNT(*) AS total_completions
      FROM lesson_progress
      GROUP BY week_number
      ORDER BY week_number
    `);

    // ── 4. COMPLETION RATES (% of students who completed each week) ──
    const totalStudentsResult = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'student'");
    const totalStudents = parseInt(totalStudentsResult.rows[0].count) || 1;

    const completionRates = await pool.query(`
      SELECT 
        week_number,
        COUNT(DISTINCT user_id) AS students_engaged,
        ROUND((COUNT(DISTINCT user_id)::numeric / $1::numeric) * 100, 1) AS completion_percent
      FROM lesson_progress
      GROUP BY week_number
      ORDER BY week_number
    `, [totalStudents]);

    // ── 5. AVG GRADES ──
    const gradeStats = await pool.query(`
      SELECT 
        COUNT(*) AS total_graded,
        ROUND(AVG(
          ((COALESCE(criterion_1,0) + COALESCE(criterion_2,0) + COALESCE(criterion_3,0) + 
            COALESCE(criterion_4,0) + COALESCE(criterion_5,0))::numeric / 25) * 100
        ), 1) AS avg_grade_percent,
        MIN(
          ((COALESCE(criterion_1,0) + COALESCE(criterion_2,0) + COALESCE(criterion_3,0) + 
            COALESCE(criterion_4,0) + COALESCE(criterion_5,0))::numeric / 25) * 100
        ) AS lowest_grade,
        MAX(
          ((COALESCE(criterion_1,0) + COALESCE(criterion_2,0) + COALESCE(criterion_3,0) + 
            COALESCE(criterion_4,0) + COALESCE(criterion_5,0))::numeric / 25) * 100
        ) AS highest_grade
      FROM submission_grades
    `);

    // ── 6. RECENT ACTIVITY (last 10 events) ──
    const recentActivity = await pool.query(`
      (SELECT 
        'signup' AS type,
        u.first_name || ' ' || u.last_name AS user_name,
        u.role,
        'New ' || u.role || ' account created' AS description,
        u.created_at AS timestamp
       FROM users u
       ORDER BY u.created_at DESC
       LIMIT 5)
      UNION ALL
      (SELECT 
        'submission' AS type,
        u.first_name || ' ' || u.last_name AS user_name,
        'student' AS role,
        'Submitted week ' || s.week_number || ' assignment' AS description,
        s.submitted_at AS timestamp
       FROM submissions s
       JOIN users u ON u.id = s.student_id
       ORDER BY s.submitted_at DESC
       LIMIT 5)
      UNION ALL
      (SELECT 
        'badge' AS type,
        u.first_name || ' ' || u.last_name AS user_name,
        'student' AS role,
        'Earned "' || b.name || '" badge' AS description,
        ub.earned_at AS timestamp
       FROM user_badges ub
       JOIN users u ON u.id = ub.user_id
       JOIN badges b ON b.id = ub.badge_id
       ORDER BY ub.earned_at DESC
       LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 15
    `);

    // ── 7. TOP BADGES (most earned) ──
    const topBadges = await pool.query(`
      SELECT 
        b.code, b.name, b.icon, b.color,
        COUNT(ub.id) AS earned_count
      FROM badges b
      LEFT JOIN user_badges ub ON ub.badge_id = b.id
      GROUP BY b.id
      ORDER BY earned_count DESC
      LIMIT 6
    `);

    // ── 8. LESSON TYPE BREAKDOWN ──
    const lessonTypeStats = await pool.query(`
      SELECT 
        SPLIT_PART(lesson_id, '-', 2) AS lesson_type_key,
        COUNT(*) AS completions
      FROM lesson_progress
      GROUP BY lesson_type_key
      ORDER BY completions DESC
    `);

    // ── 9. COACH WORKLOAD ──
    const coachWorkload = await pool.query(`
      SELECT 
        u.id, u.first_name, u.last_name,
        COUNT(DISTINCT a.student_id) AS student_count,
        (SELECT COUNT(*) FROM submission_grades g 
          JOIN submissions s ON s.id = g.submission_id 
          WHERE g.coach_id = u.id) AS graded_count
      FROM users u
      LEFT JOIN coach_student_assignments a ON a.coach_id = u.id
      WHERE u.role = 'coach'
      GROUP BY u.id
      ORDER BY student_count DESC
    `);

    res.json({
      overview: overview.rows[0],
      topStudents: topStudents.rows,
      weeklyEngagement: weeklyEngagement.rows,
      completionRates: completionRates.rows,
      gradeStats: gradeStats.rows[0],
      recentActivity: recentActivity.rows,
      topBadges: topBadges.rows,
      lessonTypeStats: lessonTypeStats.rows,
      coachWorkload: coachWorkload.rows,
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ message: err.message });
  }
};