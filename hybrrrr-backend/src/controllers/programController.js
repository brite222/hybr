import pool from "../config/db.js";

// ─── HELPER: Calculate current week based on cohort start ───
function calculateWeekInfo(cohortStartDate, totalWeeks = 8, lockMode = 'auto', maxUnlockedWeek = null) {
  const now = new Date();
  const start = new Date(cohortStartDate);
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const autoCurrentWeek = Math.max(1, Math.floor(daysSinceStart / 7) + 1);

  // If manual mode, cap at the admin's max_unlocked_week
  let currentWeek;
  if (lockMode === 'manual' && maxUnlockedWeek !== null) {
    currentWeek = Math.min(maxUnlockedWeek, totalWeeks);
  } else {
    currentWeek = Math.min(totalWeeks, autoCurrentWeek);
  }

  return {
    currentWeek,
    daysSinceStart,
    totalWeeks,
    startDate: cohortStartDate,
    lockMode,
    maxUnlockedWeek,
  };
}

// ─── GET PROGRAM OVERVIEW (all weeks with locked/unlocked status) ───
export const getProgram = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT u.cohort_id, c.name, c.start_date, c.total_weeks, c.lock_mode, c.max_unlocked_week
       FROM users u
       LEFT JOIN cohorts c ON c.id = u.cohort_id
       WHERE u.id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user || !user.cohort_id) {
      return res.status(400).json({
        message: "You are not enrolled in any cohort. Contact your admin.",
      });
    }

    const weekInfo = calculateWeekInfo(
      user.start_date,
      user.total_weeks,
      user.lock_mode,
      user.max_unlocked_week
    );

    // Get completed lessons for this user
    const progressResult = await pool.query(
      "SELECT week_number, lesson_id FROM lesson_progress WHERE user_id = $1",
      [req.userId]
    );
    const completedLessons = progressResult.rows;

    // Build weeks array
    const weeks = [];
    for (let i = 1; i <= user.total_weeks; i++) {
      const unlockDate = new Date(user.start_date);
      unlockDate.setDate(unlockDate.getDate() + (i - 1) * 7);

      const isUnlocked = i <= weekInfo.currentWeek;
      const weekLessons = completedLessons.filter(l => l.week_number === i);

      weeks.push({
        weekNumber: i,
        title: `Week ${i}`,
        isUnlocked,
        isCurrent: i === weekInfo.currentWeek,
        unlockDate: unlockDate.toISOString(),
        daysUntilUnlock: isUnlocked ? 0 : Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24)),
        completedCount: weekLessons.length,
        completedLessonIds: weekLessons.map(l => l.lesson_id),
      });
    }

    res.json({
      cohort: {
        id: user.cohort_id,
        name: user.name,
        startDate: user.start_date,
        totalWeeks: user.total_weeks,
        lockMode: weekInfo.lockMode,
        maxUnlockedWeek: weekInfo.maxUnlockedWeek,
      },
      currentWeek: weekInfo.currentWeek,
      daysSinceStart: weekInfo.daysSinceStart,
      weeks,
    });
  } catch (err) {
    console.error("Get program error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET WEEK DETAILS (check if unlocked, then return lessons) ───
export const getWeek = async (req, res) => {
  const weekNumber = parseInt(req.params.weekNumber);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 8) {
    return res.status(400).json({ message: "Invalid week number" });
  }

  try {
    const userResult = await pool.query(
      `SELECT u.cohort_id, c.start_date, c.total_weeks, c.lock_mode, c.max_unlocked_week
       FROM users u
       LEFT JOIN cohorts c ON c.id = u.cohort_id
       WHERE u.id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user || !user.cohort_id) {
      return res.status(400).json({ message: "Not enrolled in any cohort" });
    }

    const weekInfo = calculateWeekInfo(
      user.start_date,
      user.total_weeks,
      user.lock_mode,
      user.max_unlocked_week
    );

    // 🔒 BLOCK if week is locked
    if (weekNumber > weekInfo.currentWeek) {
      const unlockDate = new Date(user.start_date);
      unlockDate.setDate(unlockDate.getDate() + (weekNumber - 1) * 7);
      return res.status(403).json({
        message: "This week is locked",
        unlockDate: unlockDate.toISOString(),
        currentWeek: weekInfo.currentWeek,
        lockMode: weekInfo.lockMode,
      });
    }

    const progressResult = await pool.query(
      "SELECT lesson_id, completed_at FROM lesson_progress WHERE user_id = $1 AND week_number = $2",
      [req.userId, weekNumber]
    );

    res.json({
      weekNumber,
      isUnlocked: true,
      isCurrent: weekNumber === weekInfo.currentWeek,
      completedLessons: progressResult.rows,
    });
  } catch (err) {
    console.error("Get week error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── MARK LESSON AS COMPLETE ───
export const completeLesson = async (req, res) => {
  const { weekNumber, lessonId } = req.body;

  if (!weekNumber || !lessonId) {
    return res.status(400).json({ message: "weekNumber and lessonId required" });
  }

  try {
    const userResult = await pool.query(
      `SELECT u.cohort_id, c.start_date, c.total_weeks, c.lock_mode, c.max_unlocked_week
       FROM users u
       LEFT JOIN cohorts c ON c.id = u.cohort_id
       WHERE u.id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user || !user.cohort_id) {
      return res.status(400).json({ message: "Not enrolled" });
    }

    const weekInfo = calculateWeekInfo(
      user.start_date,
      user.total_weeks,
      user.lock_mode,
      user.max_unlocked_week
    );

    if (weekNumber > weekInfo.currentWeek) {
      return res.status(403).json({ message: "This week is locked" });
    }

    await pool.query(
      `INSERT INTO lesson_progress (user_id, week_number, lesson_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, lesson_id) DO NOTHING`,
      [req.userId, weekNumber, lessonId]
    );

    res.json({ message: "Lesson marked as complete" });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET MY PROGRESS (overall stats) ───
export const getMyProgress = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT week_number, COUNT(*) AS completed
       FROM lesson_progress
       WHERE user_id = $1
       GROUP BY week_number
       ORDER BY week_number`,
      [req.userId]
    );

    const totalResult = await pool.query(
      "SELECT COUNT(*) AS total FROM lesson_progress WHERE user_id = $1",
      [req.userId]
    );

    res.json({
      totalCompleted: parseInt(totalResult.rows[0].total),
      byWeek: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET LESSONS IN A WEEK (with completion status) ───
export const getWeekLessons = async (req, res) => {
  const weekNumber = parseInt(req.params.weekNumber);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 8) {
    return res.status(400).json({ message: "Invalid week number" });
  }

  try {
    const userResult = await pool.query(
      `SELECT u.cohort_id, c.start_date, c.total_weeks, c.lock_mode, c.max_unlocked_week
       FROM users u
       LEFT JOIN cohorts c ON c.id = u.cohort_id
       WHERE u.id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user || !user.cohort_id) {
      return res.status(400).json({ message: "Not enrolled in any cohort" });
    }

    const weekInfo = calculateWeekInfo(
      user.start_date,
      user.total_weeks,
      user.lock_mode,
      user.max_unlocked_week
    );

    // 🔒 BLOCK if week is locked
    if (weekNumber > weekInfo.currentWeek) {
      const unlockDate = new Date(user.start_date);
      unlockDate.setDate(unlockDate.getDate() + (weekNumber - 1) * 7);
      return res.status(403).json({
        message: "This week is locked",
        unlockDate: unlockDate.toISOString(),
        currentWeek: weekInfo.currentWeek,
        lockMode: weekInfo.lockMode,
      });
    }

    const progressResult = await pool.query(
      "SELECT lesson_id, completed_at FROM lesson_progress WHERE user_id = $1 AND week_number = $2",
      [req.userId, weekNumber]
    );

    const completedIds = progressResult.rows.map(r => r.lesson_id);

    res.json({
      weekNumber,
      isUnlocked: true,
      isCurrent: weekNumber === weekInfo.currentWeek,
      completedLessons: completedIds,
      completedCount: completedIds.length,
    });
  } catch (err) {
    console.error("Get week lessons error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET MY GRADES (for student) ───
export const getMyGrades = async (req, res) => {
  try {
    const userResult = await pool.query(
      `SELECT u.cohort_id, c.start_date, c.total_weeks, c.lock_mode, c.max_unlocked_week
       FROM users u
       LEFT JOIN cohorts c ON c.id = u.cohort_id
       WHERE u.id = $1`,
      [req.userId]
    );

    const user = userResult.rows[0];
    const weekInfo = user?.start_date
      ? calculateWeekInfo(
          user.start_date,
          user.total_weeks,
          user.lock_mode,
          user.max_unlocked_week
        )
      : { currentWeek: 1 };

    // ✅ UPDATED: include attended_office_hours + presented and compute full total
    const result = await pool.query(
      `
      SELECT 
        s.id AS submission_id,
        s.week_number,
        s.lesson_id,
        s.file_name,
        s.file_size,
        s.submitted_at,
        g.id AS grade_id,
        g.criterion_1,
        g.criterion_2,
        g.criterion_3,
        g.criterion_4,
        g.criterion_5,
        g.feedback,
        g.graded_at,
        g.attended_office_hours,
        g.presented,
        COALESCE(
          g.criterion_1 + g.criterion_2 + g.criterion_3 + g.criterion_4 + g.criterion_5,
          0
        ) AS criteria_total,
        c.first_name AS coach_first_name,
        c.last_name  AS coach_last_name
      FROM submissions s
      LEFT JOIN submission_grades g ON g.submission_id = s.id
      LEFT JOIN users c ON c.id = g.coach_id
      WHERE s.student_id = $1
      ORDER BY s.week_number ASC, s.submitted_at DESC
      `,
      [req.userId]
    );

    const MAX_SCORE = 32; // 25 (criteria) + 2 (office hours) + 5 (presentation)

    const submissions = result.rows.map(row => {
      const isGraded = !!row.grade_id;

      const officeHoursPoints =
        row.attended_office_hours === true ? 2 :
        row.attended_office_hours === false ? -2 : 0;

      const presentationPoints = row.presented === true ? 5 : 0;

      const criteriaTotal = parseInt(row.criteria_total) || 0;
      const totalScore = criteriaTotal + officeHoursPoints + presentationPoints;

      // For the % we clamp to 0 so a negative never shows as a weird minus %
      const percent = isGraded
        ? Math.max(0, Math.round((totalScore / MAX_SCORE) * 100))
        : 0;

      return {
        ...row,
        is_graded: isGraded,
        criteria_total: criteriaTotal,
        office_hours_points: officeHoursPoints,
        presentation_points: presentationPoints,
        total_score: totalScore,
        max_score: MAX_SCORE,
        percent,
      };
    });

    const byWeek = {};
    submissions.forEach(row => {
      const week = row.week_number;
      if (!byWeek[week]) byWeek[week] = [];
      byWeek[week].push(row);
    });

    res.json({
      submissions,
      by_week: byWeek,
      total: submissions.length,
      graded_count: submissions.filter(r => r.is_graded).length,
      currentWeek: weekInfo.currentWeek,
    });
  } catch (err) {
    console.error("getMyGrades error:", err);
    res.status(500).json({ message: err.message });
  }
};