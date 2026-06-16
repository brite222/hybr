import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeNewUserTemplate } from "../utils/emailTemplates.js";

// ─── STATS ───────────────────────────────
export const getStats = async (req, res) => {
  try {
    const counts = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'admin') AS admins,
        COUNT(*) FILTER (WHERE role = 'coach') AS coaches,
        COUNT(*) FILTER (WHERE role = 'student') AS students,
        COUNT(*) AS total
      FROM users
    `);
    const assignments = await pool.query("SELECT COUNT(*) FROM coach_student_assignments");

    res.json({
      ...counts.rows[0],
      assignments: parseInt(assignments.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── LIST USERS ───────────────────────────
export const getUsers = async (req, res) => {
  const { role } = req.query;
  try {
    let query = `
      SELECT 
        id, email, first_name, last_name, role, 
        is_verified, created_at, tier, cohort_id
      FROM users
    `;
    const params = [];
    if (role) {
      query += ` WHERE role = $1`;
      params.push(role);
    }
    query += ` ORDER BY created_at DESC`;
    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── CREATE USER (with email + auto-assign coach) ───
export const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, cohortId, tier, coachId } = req.body;

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ message: "Name, email, and role required" });
  }
  if (!["coach", "student", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  // Auto-generate temp password if not provided
  let finalPassword = password;
  let isTemp = false;
  if (!finalPassword) {
    finalPassword = Math.random().toString(36).slice(-10);
    isTemp = true;
  }
  if (finalPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  if (role === "student" && !cohortId) {
    return res.status(400).json({ message: "Students must be assigned to a cohort" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(finalPassword, salt);
    const userTier = role === "student" ? (tier || "standard") : null;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, 
                          is_verified, must_change_password, cohort_id, tier)
       VALUES ($1, $2, $3, $4, $5, TRUE, $6, $7, $8)
       RETURNING id, email, first_name, last_name, role, cohort_id, tier`,
      [firstName, lastName, email, hashed, role, isTemp, cohortId || null, userTier]
    );
    const newUser = result.rows[0];

    // Auto-assign to coach if specified
    let assignedCoachId = null;
    if (role === "student" && coachId) {
      try {
        await pool.query(
          `INSERT INTO coach_student_assignments (coach_id, student_id, assigned_by)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [coachId, newUser.id, req.user.id]
        );
        assignedCoachId = coachId;
      } catch (err) {
        console.error("Auto-assign coach failed:", err);
      }
    }

    // ✅ SEND WELCOME EMAIL with login info
    try {
      await sendEmail({
        to: email,
        subject: `Your ALPHA account is ready, ${firstName}`,
        html: welcomeNewUserTemplate({
          firstName,
          lastName,
          email,
          tempPassword: finalPassword,
          role,
        }),
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error(`⚠️ Email send failed for ${email}:`, emailErr.message);
    }

    res.status(201).json({
      message: "User created and welcome email sent",
      user: newUser,
      tempPassword: isTemp ? finalPassword : undefined,
      assignedCoach: assignedCoachId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE USER TIER ───
export const updateUserTier = async (req, res) => {
  const { id } = req.params;
  const { tier } = req.body;

  if (!["standard", "premium"].includes(tier)) {
    return res.status(400).json({ message: "Invalid tier" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET tier = $1 WHERE id = $2 AND role = 'student' RETURNING id, tier",
      [tier, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Tier updated", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE USER ──────────────────────────
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: "You cannot delete yourself" });
  }
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ASSIGNMENTS LIST ─────────────────────
export const getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id, a.assigned_at,
        c.id AS coach_id, c.first_name AS coach_first, c.last_name AS coach_last, c.email AS coach_email,
        s.id AS student_id, s.first_name AS student_first, s.last_name AS student_last, s.email AS student_email
      FROM coach_student_assignments a
      JOIN users c ON c.id = a.coach_id
      JOIN users s ON s.id = a.student_id
      ORDER BY a.assigned_at DESC
    `);
    res.json({ assignments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── ASSIGN STUDENT TO COACH ──────────────
export const createAssignment = async (req, res) => {
  const { coachId, studentId } = req.body;
  if (!coachId || !studentId) {
    return res.status(400).json({ message: "coachId and studentId required" });
  }

  try {
    const check = await pool.query(
      "SELECT id, role FROM users WHERE id IN ($1, $2)",
      [coachId, studentId]
    );
    const coach = check.rows.find(u => u.id === parseInt(coachId));
    const student = check.rows.find(u => u.id === parseInt(studentId));

    if (!coach || coach.role !== "coach") {
      return res.status(400).json({ message: "Invalid coach" });
    }
    if (!student || student.role !== "student") {
      return res.status(400).json({ message: "Invalid student" });
    }

    const result = await pool.query(
      `INSERT INTO coach_student_assignments (coach_id, student_id, assigned_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [coachId, studentId, req.user.id]
    );

    res.status(201).json({ message: "Assigned", assignment: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Already assigned" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE ASSIGNMENT ────────────────────
export const deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM coach_student_assignments WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.json({ message: "Unassigned" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── COHORTS ─────────────────────────────────────
export const getCohorts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(u.id) AS student_count
      FROM cohorts c
      LEFT JOIN users u ON u.cohort_id = c.id AND u.role = 'student'
      GROUP BY c.id
      ORDER BY c.start_date DESC
    `);
    res.json({ cohorts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createCohort = async (req, res) => {
  const { name, startDate, totalWeeks } = req.body;
  if (!name || !startDate) {
    return res.status(400).json({ message: "Name and start date required" });
  }
  try {
    const weeks = totalWeeks || 8;
    const result = await pool.query(
      `INSERT INTO cohorts (name, start_date, end_date, total_weeks)
       VALUES ($1, $2, $2::date + ($3 * 7 || ' days')::interval, $3)
       RETURNING *`,
      [name, startDate, weeks]
    );
    res.status(201).json({ message: "Cohort created", cohort: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};