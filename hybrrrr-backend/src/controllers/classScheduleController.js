import pool from "../config/db.js";

// ─── ADMIN: Create class ───
export const createClass = async (req, res) => {
  const { title, description, meeting_link, scheduled_at, cohort_id } = req.body;

  if (!title || !scheduled_at || !cohort_id) {
    return res.status(400).json({ message: "title, scheduled_at, and cohort_id required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO class_schedules (title, description, meeting_link, scheduled_at, cohort_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || null, meeting_link || null, scheduled_at, cohort_id, req.user.id]
    );
    res.json({ message: "Class scheduled", class: result.rows[0] });
  } catch (err) {
    console.error("createClass error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: List all classes ───
export const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cs.*, c.name AS cohort_name,
             (SELECT COUNT(*) FROM users WHERE cohort_id = cs.cohort_id AND role = 'student') AS student_count
      FROM class_schedules cs
      LEFT JOIN cohorts c ON c.id = cs.cohort_id
      ORDER BY cs.scheduled_at DESC
    `);
    res.json({ classes: result.rows });
  } catch (err) {
    console.error("getAllClasses error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: Update class ───
export const updateClass = async (req, res) => {
  const { id } = req.params;
  const { title, description, meeting_link, scheduled_at, cohort_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE class_schedules
       SET title = $1, description = $2, meeting_link = $3, scheduled_at = $4, cohort_id = $5,
           notified_24h = FALSE, notified_1h = FALSE, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [title, description || null, meeting_link || null, scheduled_at, cohort_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class updated", class: result.rows[0] });
  } catch (err) {
    console.error("updateClass error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: Delete class ───
export const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM class_schedules WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json({ message: "Class deleted" });
  } catch (err) {
    console.error("deleteClass error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── STUDENT: Get upcoming classes for their cohort ───
export const getMyUpcomingClasses = async (req, res) => {
  try {
    const userResult = await pool.query("SELECT cohort_id FROM users WHERE id = $1", [req.user.id]);
    const cohortId = userResult.rows[0]?.cohort_id;
    if (!cohortId) return res.json({ classes: [] });

    const result = await pool.query(
      `SELECT * FROM class_schedules
       WHERE cohort_id = $1 AND scheduled_at >= NOW()
       ORDER BY scheduled_at ASC
       LIMIT 10`,
      [cohortId]
    );
    res.json({ classes: result.rows });
  } catch (err) {
    console.error("getMyUpcomingClasses error:", err);
    res.status(500).json({ message: err.message });
  }
};