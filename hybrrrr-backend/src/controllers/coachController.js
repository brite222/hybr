import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import { assignmentGradedTemplate } from "../utils/emailTemplates.js";

// ─── HELPER: Calculate current week ───
function getCurrentWeek(startDate, totalWeeks = 8) {
  const now = new Date();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(totalWeeks, Math.max(1, Math.floor(daysSinceStart / 7) + 1));
}

// ─── HELPER: Calculate bonus/penalty points ───
function calculateBonusPoints(attended_office_hours, presented) {
  const officeHoursPoints =
    attended_office_hours === true ? 2 :
    attended_office_hours === false ? -2 : 0;
  const presentationPoints = presented === true ? 5 : 0;
  return { officeHoursPoints, presentationPoints };
}

// ─── GET MY STUDENTS ───
export const getMyStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, 
        COALESCE(u.tier, 'standard') AS tier,
        u.profile_picture,
        u.school, u.age, u.grade, u.cohort_id,
        c.start_date AS cohort_start, c.total_weeks,
        a.assigned_at,
        COALESCE((SELECT COUNT(*) FROM lesson_progress WHERE user_id = u.id), 0) AS completed_lessons,
        COALESCE((SELECT COUNT(*) FROM submissions WHERE student_id = u.id), 0) AS total_submissions
      FROM coach_student_assignments a
      JOIN users u ON u.id = a.student_id
      LEFT JOIN cohorts c ON c.id = u.cohort_id
      WHERE a.coach_id = $1
      ORDER BY 
        CASE WHEN u.tier = 'premium' THEN 0 ELSE 1 END,
        u.first_name ASC
    `, [req.user.id]);

    const students = result.rows.map(s => {
      const currentWeek = s.cohort_start ? getCurrentWeek(s.cohort_start, s.total_weeks || 8) : 1;
      const expectedLessons = currentWeek * 8;
      const actualLessons = parseInt(s.completed_lessons) || 0;
      const progressPercent = expectedLessons > 0
        ? Math.min(100, Math.round((actualLessons / expectedLessons) * 100))
        : 0;
      const onTrack = progressPercent >= 75;

      return {
        ...s,
        current_week: currentWeek,
        progress_percent: progressPercent,
        on_track: onTrack,
      };
    });

    const premium = students.filter(s => s.tier === "premium");
    const standard = students.filter(s => s.tier === "standard");

    res.json({ premium, standard, total: students.length });
  } catch (err) {
    console.error("getMyStudents error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ONE STUDENT'S DETAILED PROGRESS ───
export const getStudentDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await pool.query(
      "SELECT 1 FROM coach_student_assignments WHERE coach_id = $1 AND student_id = $2",
      [req.user.id, id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Student not found or not assigned to you" });
    }

    const studentResult = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, 
        COALESCE(u.tier, 'standard') AS tier,
        u.profile_picture,
        u.school, u.age, u.grade,
        c.id AS cohort_id, c.name AS cohort_name, c.start_date, c.total_weeks
      FROM users u
      LEFT JOIN cohorts c ON c.id = u.cohort_id
      WHERE u.id = $1
    `, [id]);

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    const student = studentResult.rows[0];

    const progressResult = await pool.query(
      "SELECT week_number, lesson_id, completed_at FROM lesson_progress WHERE user_id = $1 ORDER BY completed_at DESC",
      [id]
    );

    // ✅ UPDATED: include office hours + presentation in total score
    const submissionsResult = await pool.query(`
      SELECT 
        s.*,
        g.criterion_1, g.criterion_2, g.criterion_3, g.criterion_4, g.criterion_5,
        g.attended_office_hours, g.presented,
        COALESCE(
          g.criterion_1 + g.criterion_2 + g.criterion_3 + g.criterion_4 + g.criterion_5,
          0
        )
        + CASE WHEN g.attended_office_hours = true THEN 2
               WHEN g.attended_office_hours = false THEN -2
               ELSE 0 END
        + CASE WHEN g.presented = true THEN 5 ELSE 0 END
        AS total_score,
        g.feedback, 
        g.graded_at
      FROM submissions s
      LEFT JOIN submission_grades g ON g.submission_id = s.id
      WHERE s.student_id = $1
      ORDER BY s.submitted_at DESC
    `, [id]);

    const quizResult = await pool.query(
      "SELECT * FROM quiz_attempts WHERE student_id = $1 ORDER BY submitted_at DESC",
      [id]
    );

    const currentWeek = student.start_date ? getCurrentWeek(student.start_date, student.total_weeks || 8) : 1;
    const completedLessons = progressResult.rows;
    const expectedLessons = currentWeek * 8;
    const progressPercent = expectedLessons > 0
      ? Math.min(100, Math.round((completedLessons.length / expectedLessons) * 100))
      : 0;

    res.json({
      student: {
        ...student,
        current_week: currentWeek,
        progress_percent: progressPercent,
        on_track: progressPercent >= 75,
      },
      completed_lessons: completedLessons,
      submissions: submissionsResult.rows,
      quiz_attempts: quizResult.rows,
    });
  } catch (err) {
    console.error("getStudentDetails error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL SUBMISSIONS TO GRADE ───
export const getGradingQueue = async (req, res) => {
  try {
    // ✅ UPDATED: return office hours + presentation fields and include them in total
    const result = await pool.query(`
      SELECT 
        s.id, s.week_number, s.lesson_id, s.file_name, s.file_path,
        s.file_size, s.submitted_at,
        u.id AS student_id, u.first_name, u.last_name, u.email, 
        COALESCE(u.tier, 'standard') AS tier,
        g.id AS grade_id, 
        g.criterion_1, g.criterion_2, g.criterion_3, g.criterion_4, g.criterion_5,
        g.feedback, g.graded_at,
        g.attended_office_hours, g.presented,
        COALESCE(
          g.criterion_1 + g.criterion_2 + g.criterion_3 + g.criterion_4 + g.criterion_5,
          0
        )
        + CASE WHEN g.attended_office_hours = true THEN 2
               WHEN g.attended_office_hours = false THEN -2
               ELSE 0 END
        + CASE WHEN g.presented = true THEN 5 ELSE 0 END
        AS total_score
      FROM submissions s
      JOIN coach_student_assignments a ON a.student_id = s.student_id
      JOIN users u ON u.id = s.student_id
      LEFT JOIN submission_grades g ON g.submission_id = s.id
      WHERE a.coach_id = $1
      ORDER BY s.submitted_at DESC
    `, [req.user.id]);

    const submissions = result.rows.map(s => ({
      ...s,
      is_graded: !!s.grade_id,
    }));

    const byWeek = {};
    submissions.forEach(s => {
      const week = s.week_number;
      if (!byWeek[week]) byWeek[week] = [];
      byWeek[week].push(s);
    });

    res.json({ submissions, by_week: byWeek });
  } catch (err) {
    console.error("getGradingQueue error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── GRADE A SUBMISSION (with email notification) ───
export const gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const {
    criterion_1, criterion_2, criterion_3, criterion_4, criterion_5,
    feedback,
    attended_office_hours, // ✅ NEW (boolean or null)
    presented,             // ✅ NEW (boolean or null)
  } = req.body;

  try {
    // Verify this submission belongs to one of the coach's students
    const check = await pool.query(`
      SELECT s.id FROM submissions s
      JOIN coach_student_assignments a ON a.student_id = s.student_id
      WHERE s.id = $1 AND a.coach_id = $2
    `, [submissionId, req.user.id]);

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to grade this submission" });
    }

    // ✅ UPDATED: Upsert grade including new fields
    const result = await pool.query(`
      INSERT INTO submission_grades 
        (submission_id, coach_id, criterion_1, criterion_2, criterion_3, criterion_4, criterion_5,
         feedback, attended_office_hours, presented)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (submission_id) 
      DO UPDATE SET
        criterion_1 = EXCLUDED.criterion_1,
        criterion_2 = EXCLUDED.criterion_2,
        criterion_3 = EXCLUDED.criterion_3,
        criterion_4 = EXCLUDED.criterion_4,
        criterion_5 = EXCLUDED.criterion_5,
        feedback = EXCLUDED.feedback,
        attended_office_hours = EXCLUDED.attended_office_hours,
        presented = EXCLUDED.presented,
        graded_at = NOW()
      RETURNING *
    `, [
      submissionId, req.user.id,
      criterion_1, criterion_2, criterion_3, criterion_4, criterion_5,
      feedback,
      attended_office_hours,
      presented,
    ]);

    // ✅ SEND EMAIL TO STUDENT (with updated score calculation)
    try {
      const studentInfo = await pool.query(`
        SELECT u.first_name, u.email, s.week_number, 
               c.first_name AS coach_first, c.last_name AS coach_last
        FROM submissions s
        JOIN users u ON u.id = s.student_id
        JOIN users c ON c.id = $2
        WHERE s.id = $1
      `, [submissionId, req.user.id]);

      if (studentInfo.rows[0]?.email) {
        const criteriaTotal =
          (parseInt(criterion_1) || 0) + (parseInt(criterion_2) || 0) +
          (parseInt(criterion_3) || 0) + (parseInt(criterion_4) || 0) +
          (parseInt(criterion_5) || 0);

        const { officeHoursPoints, presentationPoints } =
          calculateBonusPoints(attended_office_hours, presented);

        const totalScore = criteriaTotal + officeHoursPoints + presentationPoints;

         await sendEmail({
          to: studentInfo.rows[0].email,
          subject: `Your Week ${studentInfo.rows[0].week_number} assignment has been graded! `,
          html: assignmentGradedTemplate({
            firstName: studentInfo.rows[0].first_name,
            weekNumber: studentInfo.rows[0].week_number,
            score: totalScore,
            totalScore: 32,
            feedback: feedback || "",
            coachName: `${studentInfo.rows[0].coach_first} ${studentInfo.rows[0].coach_last?.charAt(0) || ""}.`,
            // ✅ NEW breakdown fields
            criteriaTotal,
            officeHoursPoints,
            presentationPoints,
            attendedOfficeHours: attended_office_hours,
            presented,
          }),
        });
        console.log(`✅ Grade notification email sent to ${studentInfo.rows[0].email}`);
      }
    } catch (emailErr) {
      console.error("Grade email failed:", emailErr.message);
    }

    res.json({ message: "Grade saved", grade: result.rows[0] });
  } catch (err) {
    console.error("gradeSubmission error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── COACH DASHBOARD STATS ───
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT a.student_id) AS total_students,
        COUNT(DISTINCT CASE WHEN u.tier = 'premium' THEN a.student_id END) AS premium_count,
        COUNT(DISTINCT CASE WHEN u.tier = 'standard' OR u.tier IS NULL THEN a.student_id END) AS standard_count,
        (SELECT COUNT(*) FROM submissions s 
          JOIN coach_student_assignments aa ON aa.student_id = s.student_id 
          WHERE aa.coach_id = $1) AS total_submissions,
        (SELECT COUNT(*) FROM submissions s 
          JOIN coach_student_assignments aa ON aa.student_id = s.student_id 
          LEFT JOIN submission_grades g ON g.submission_id = s.id
          WHERE aa.coach_id = $1 AND g.id IS NULL) AS ungraded
      FROM coach_student_assignments a
      JOIN users u ON u.id = a.student_id
      WHERE a.coach_id = $1
    `, [req.user.id]);

    res.json(stats.rows[0]);
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: err.message });
  }
};