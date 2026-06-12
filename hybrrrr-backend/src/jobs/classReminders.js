import cron from "node-cron";
import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import { classReminderTemplate } from "../utils/emailTemplates.js";
import { createNotification } from "../controllers/notificationsController.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Send reminder for a single class
async function sendReminders(classRow, when /* '24h' | '1h' */) {
  try {
    // Get all students in that cohort
    const studentsResult = await pool.query(
      `SELECT id, first_name, email FROM users 
       WHERE cohort_id = $1 AND role = 'student'`,
      [classRow.cohort_id]
    );

    const students = studentsResult.rows;
    if (students.length === 0) return;

    const timeLabel = when === "24h" ? "tomorrow" : "in 1 hour";
    const subjectPrefix = when === "24h" ? "⏰ Reminder" : "🔔 Starting Soon";

    for (const student of students) {
      // 1) Create in-app notification
      await createNotification({
        userId: student.id,
        type: "class_reminder",
        title: `${classRow.title} starts ${timeLabel}`,
        message: classRow.description || `Don't forget your class ${timeLabel}!`,
        link: classRow.meeting_link || "/dashboard",
      });

      // 2) Send email
      try {
        await sendEmail({
          to: student.email,
          subject: `${subjectPrefix}: ${classRow.title} ${timeLabel}`,
          html: classReminderTemplate({
            firstName: student.first_name,
            classTitle: classRow.title,
            classDescription: classRow.description,
            scheduledAt: classRow.scheduled_at,
            meetingLink: classRow.meeting_link,
            when, // '24h' | '1h'
            dashboardUrl: `${FRONTEND_URL}/dashboard`,
          }),
        });
      } catch (emailErr) {
        console.error(`Email failed for ${student.email}:`, emailErr.message);
      }
    }

    // Mark as notified
    const column = when === "24h" ? "notified_24h" : "notified_1h";
    await pool.query(
      `UPDATE class_schedules SET ${column} = TRUE WHERE id = $1`,
      [classRow.id]
    );

    console.log(`✅ Sent ${when} reminders for class "${classRow.title}" to ${students.length} students`);
  } catch (err) {
    console.error(`sendReminders (${when}) error:`, err);
  }
}

// Check for classes that need reminders
async function checkAndSendReminders() {
  try {
    const now = new Date();

    // 24h reminders: classes between 23h and 25h from now, not yet notified
    const in24h = await pool.query(`
      SELECT * FROM class_schedules
      WHERE notified_24h = FALSE
        AND scheduled_at BETWEEN NOW() + INTERVAL '23 hours' AND NOW() + INTERVAL '25 hours'
    `);

    for (const row of in24h.rows) {
      await sendReminders(row, "24h");
    }

    // 1h reminders: classes between 50min and 70min from now, not yet notified
    const in1h = await pool.query(`
      SELECT * FROM class_schedules
      WHERE notified_1h = FALSE
        AND scheduled_at BETWEEN NOW() + INTERVAL '50 minutes' AND NOW() + INTERVAL '70 minutes'
    `);

    for (const row of in1h.rows) {
      await sendReminders(row, "1h");
    }
  } catch (err) {
    console.error("checkAndSendReminders error:", err);
  }
}

// Start the cron job
export function startClassReminderJob() {
  // Run every 10 minutes
  cron.schedule("*/10 * * * *", () => {
    console.log("⏰ Checking for class reminders...");
    checkAndSendReminders();
  });

  console.log("✅ Class reminder cron job started (runs every 10 minutes)");
}