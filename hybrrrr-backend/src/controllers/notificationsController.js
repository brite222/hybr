import pool from "../config/db.js";

// ─── Get current user's notifications ───
export const getMyNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    const unreadResult = await pool.query(
      `SELECT COUNT(*) AS unread FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [req.user.id]
    );

    res.json({
      notifications: result.rows,
      unread: parseInt(unreadResult.rows[0].unread),
    });
  } catch (err) {
    console.error("getMyNotifications error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─── Mark a single notification as read ───
export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Mark all as read ───
export const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Helper: create a notification (used by cron + other places) ───
export async function createNotification({ userId, type, title, message, link }) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, link || null]
    );
  } catch (err) {
    console.error("createNotification error:", err);
  }
}