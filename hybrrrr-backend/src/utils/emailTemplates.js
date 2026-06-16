// ── Brand colors ──
const BRAND = {
  green: "#8DC540",
  darkGreen: "#648C2D",
  blue: "#196AB4",
  black: "#000000",
  gray: "#666666",
  lightGray: "#f5f5f5",
};

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ── Reusable header/footer ──
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ALPHA</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.lightGray};font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.lightGray};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:${BRAND.black};padding:30px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:36px;letter-spacing:3px;font-weight:700;">ALPHA</h1>
              <p style="color:#999;margin:4px 0 0;font-size:11px;letter-spacing:1.5px;">BY HYBR</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BRAND.lightGray};padding:24px 40px;text-align:center;border-top:1px solid #eee;">
              <p style="color:${BRAND.gray};font-size:12px;margin:0 0 8px;">
                © 2026 HYBR GROUP. All rights reserved.
              </p>
              <p style="color:${BRAND.gray};font-size:11px;margin:0;">
                Powering the ALPHA Innovation Program
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Reusable button ──
const button = (text, url, color = BRAND.green) => `
  <table cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background:${color};border-radius:100px;">
        <a href="${url}" 
           style="display:inline-block;padding:14px 36px;color:#000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
          ${text} →
        </a>
      </td>
    </tr>
  </table>
`;

// ═══════════════════════════════════════════════════════════════
// 🎓 NEW USER WELCOME — Spam-filter optimized
// ═══════════════════════════════════════════════════════════════
export const welcomeNewUserTemplate = ({ firstName, lastName, email, tempPassword, role }) => {
  const isStudent = role === "student";
  const isCoach = role === "coach";

  const roleLabel = isStudent
    ? "ALPHA innovation program"
    : isCoach
      ? "ALPHA coaching team"
      : "ALPHA administration team";

  const content = `
    <h2 style="color:${BRAND.black};font-size:24px;margin:0 0 16px;font-weight:600;">
      Hello ${firstName},
    </h2>

    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 16px;">
      Your account has been created. You are now part of the ${roleLabel}.
    </p>

    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 24px;">
      Below are your login credentials to access the platform.
    </p>

    <div style="background:${BRAND.lightGray};border-left:4px solid ${BRAND.green};padding:20px;border-radius:8px;margin:24px 0;">
      <p style="margin:0 0 12px;color:${BRAND.gray};font-size:13px;font-weight:700;letter-spacing:0.5px;">
        ACCOUNT INFORMATION
      </p>
      <p style="margin:8px 0;color:${BRAND.black};font-size:15px;">
        <strong>Email address:</strong> ${email}
      </p>
      <p style="margin:8px 0;color:${BRAND.black};font-size:15px;">
        <strong>One-time access code:</strong> <span style="font-family:Courier New, monospace;background:#fff;padding:4px 10px;border-radius:4px;border:1px solid #ddd;">${tempPassword}</span>
      </p>
    </div>

    <p style="color:${BRAND.gray};font-size:14px;line-height:1.6;margin:0 0 16px;">
      For your security, you will be asked to set a new access code the first time you sign in.
    </p>

    ${button("Sign In", `${FRONTEND_URL}/login`)}

    ${isStudent ? `
      <h3 style="color:${BRAND.black};font-size:18px;margin:32px 0 12px;font-weight:600;">Getting started</h3>
      <ul style="color:${BRAND.gray};font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Sign in and set your new access code</li>
        <li>Review the 8-week program roadmap</li>
        <li>Begin Week 1 lessons</li>
        <li>Track your progress as you complete activities</li>
      </ul>
    ` : isCoach ? `
      <h3 style="color:${BRAND.black};font-size:18px;margin:32px 0 12px;font-weight:600;">Getting started</h3>
      <ul style="color:${BRAND.gray};font-size:14px;line-height:1.8;padding-left:20px;margin:0;">
        <li>Sign in and set your new access code</li>
        <li>View students assigned to you</li>
        <li>Monitor their weekly progress</li>
        <li>Provide feedback on submitted work</li>
      </ul>
    ` : ""}

    <p style="color:${BRAND.gray};font-size:13px;margin:32px 0 0;line-height:1.6;">
      If you have questions, reply to this email and our team will assist you.
    </p>

    <p style="color:#999;font-size:12px;margin:24px 0 0;line-height:1.6;border-top:1px solid #eee;padding-top:16px;">
      You received this message because an administrator created an ALPHA account using your email address. If this was not expected, please contact us at <a href="mailto:support@hybrgroup.net" style="color:${BRAND.blue};">support@hybrgroup.net</a>.
    </p>
  `;

  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 🎖️ BADGE EARNED
// ═══════════════════════════════════════════════════════════════
export const badgeEarnedTemplate = ({ firstName, badgeName, badgeDescription, badgeIcon, totalBadges }) => {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:80px;margin:0 0 16px;">${badgeIcon}</div>
      <h2 style="color:${BRAND.black};font-size:28px;margin:0 0 8px;font-weight:600;">
        🎉 New Badge Unlocked!
      </h2>
      <p style="color:${BRAND.green};font-size:22px;font-weight:700;margin:0 0 16px;">
        ${badgeName}
      </p>
      <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 24px;">
        ${badgeDescription}
      </p>
    </div>

    <div style="background:${BRAND.lightGray};padding:20px;border-radius:8px;text-align:center;margin:24px 0;">
      <p style="margin:0;color:${BRAND.gray};font-size:14px;">
        Great job, <strong>${firstName}</strong>! You now have <strong>${totalBadges}</strong> badge${totalBadges !== 1 ? "s" : ""}.
      </p>
    </div>

    ${button("View All Achievements", `${FRONTEND_URL}/achievements`)}
  `;
  
  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 📝 ASSIGNMENT GRADED
// ═══════════════════════════════════════════════════════════════
export const assignmentGradedTemplate = ({
  firstName,
  weekNumber,
  score,
  totalScore,
  feedback,
  coachName,
  // ✅ NEW (optional — won't break old calls)
  criteriaTotal,
  officeHoursPoints,
  presentationPoints,
  attendedOfficeHours,
  presented,
}) => {
  const safeMax = totalScore || 32;
  const percent = Math.max(0, Math.round((score / safeMax) * 100));
  const gradeColor = percent >= 75 ? BRAND.green : percent >= 50 ? "#F0AD4E" : "#E74C3C";

  // Office Hours pretty label
  const officeHoursLabel =
    attendedOfficeHours === true ? "✅ Yes" :
    attendedOfficeHours === false ? "❌ No" : "— Not set";
  const officeHoursValue =
    officeHoursPoints > 0 ? `+${officeHoursPoints}` :
    officeHoursPoints < 0 ? `${officeHoursPoints}` : "0";
  const officeHoursColor =
    officeHoursPoints > 0 ? BRAND.darkGreen :
    officeHoursPoints < 0 ? "#C0392B" : BRAND.gray;

  // Presentation pretty label
  const presentationLabel =
    presented === true ? "✅ Yes" :
    presented === false ? "❌ No" : "— Not set";
  const presentationValue =
    presentationPoints > 0 ? `+${presentationPoints}` : "0";
  const presentationColor =
    presentationPoints > 0 ? BRAND.darkGreen : BRAND.gray;

  // Only render the breakdown if at least one bonus value was passed
  const hasBreakdown =
    criteriaTotal !== undefined ||
    officeHoursPoints !== undefined ||
    presentationPoints !== undefined;

  const content = `
    <h2 style="color:${BRAND.black};font-size:24px;margin:0 0 16px;font-weight:600;">
      Your assignment has been graded! 📝
    </h2>
    
    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName}, ${coachName} reviewed your Week ${weekNumber} work assignment.
    </p>

    <div style="background:${BRAND.lightGray};padding:32px;border-radius:12px;text-align:center;margin:24px 0;">
      <p style="margin:0 0 8px;color:${BRAND.gray};font-size:13px;font-weight:700;letter-spacing:1px;">
        YOUR FINAL SCORE
      </p>
      <div style="font-size:56px;font-weight:800;color:${gradeColor};line-height:1;">
        ${percent}%
      </div>
      <p style="margin:8px 0 0;color:${BRAND.gray};font-size:14px;">
        ${score} out of ${safeMax} points
      </p>
    </div>

    ${hasBreakdown ? `
      <div style="background:#fff;border:1px solid #EDEDED;border-radius:12px;padding:24px;margin:16px 0;">
        <p style="margin:0 0 16px;color:${BRAND.black};font-size:13px;font-weight:700;letter-spacing:1px;">
          📊 SCORE BREAKDOWN
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="font-family:'Segoe UI',Roboto,Arial,sans-serif;">
          <tr>
            <td style="padding:10px 0;color:${BRAND.gray};font-size:14px;border-bottom:1px solid #f5f5f5;">
              Criteria (1–5)
            </td>
            <td style="padding:10px 0;color:${BRAND.black};font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f5f5f5;">
              ${criteriaTotal ?? "—"} / 25
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${BRAND.gray};font-size:14px;border-bottom:1px solid #f5f5f5;">
              Office Hours <span style="color:#999;font-size:12px;">(${officeHoursLabel})</span>
            </td>
            <td style="padding:10px 0;color:${officeHoursColor};font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f5f5f5;">
              ${officeHoursValue}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:${BRAND.gray};font-size:14px;border-bottom:1px solid #f5f5f5;">
              Presentation <span style="color:#999;font-size:12px;">(${presentationLabel})</span>
            </td>
            <td style="padding:10px 0;color:${presentationColor};font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #f5f5f5;">
              ${presentationValue}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0 0;color:${BRAND.black};font-size:15px;font-weight:700;">
              Final Score
            </td>
            <td style="padding:14px 0 0;color:${BRAND.black};font-size:15px;font-weight:700;text-align:right;">
              ${score} / ${safeMax}
            </td>
          </tr>
        </table>
      </div>
    ` : ""}

    ${feedback ? `
      <div style="background:#e3f2fd;border-left:4px solid ${BRAND.blue};padding:20px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 8px;color:${BRAND.blue};font-size:13px;font-weight:700;letter-spacing:0.5px;">
          💬 COACH FEEDBACK
        </p>
        <p style="margin:0;color:${BRAND.black};font-size:14px;line-height:1.6;">
          "${feedback}"
        </p>
      </div>
    ` : ""}

    ${button("View Full Results", `${FRONTEND_URL}/my-grades`)}
  `;
  
  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 📤 NEW SUBMISSION FOR COACH
// ═══════════════════════════════════════════════════════════════
export const newSubmissionTemplate = ({ coachName, studentName, weekNumber, lessonTitle }) => {
  const content = `
    <h2 style="color:${BRAND.black};font-size:24px;margin:0 0 16px;font-weight:600;">
      📥 New submission from ${studentName}
    </h2>
    
    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi ${coachName}, one of your students just submitted their work assignment.
    </p>

    <div style="background:${BRAND.lightGray};padding:20px;border-radius:8px;margin:24px 0;">
      <p style="margin:8px 0;color:${BRAND.black};font-size:15px;">
        <strong>Student:</strong> ${studentName}
      </p>
      <p style="margin:8px 0;color:${BRAND.black};font-size:15px;">
        <strong>Week:</strong> ${weekNumber}
      </p>
      <p style="margin:8px 0;color:${BRAND.black};font-size:15px;">
        <strong>Assignment:</strong> ${lessonTitle}
      </p>
    </div>

    ${button("Review & Grade", `${FRONTEND_URL}/coach/grading`, BRAND.blue)}
  `;
  
  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 🔓 NEW WEEK UNLOCKED
// ═══════════════════════════════════════════════════════════════
export const weekUnlockedTemplate = ({ firstName, weekNumber, weekTitle, weekSubtitle }) => {
  const content = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin:0 0 16px;">🔓</div>
      <h2 style="color:${BRAND.black};font-size:28px;margin:0 0 8px;font-weight:600;">
        Week ${weekNumber} is now unlocked!
      </h2>
      <p style="color:${BRAND.green};font-size:22px;font-weight:700;margin:0 0 16px;">
        ${weekTitle}
      </p>
      <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 24px;">
        ${weekSubtitle}
      </p>
    </div>

    <p style="color:${BRAND.gray};font-size:15px;line-height:1.6;text-align:center;">
      Hi ${firstName}, fresh content is waiting for you. Keep the momentum going! 🚀
    </p>

    ${button(`Start Week ${weekNumber}`, `${FRONTEND_URL}/week/${weekNumber}`)}
  `;
  
  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 🔑 PASSWORD CHANGED CONFIRMATION
// ═══════════════════════════════════════════════════════════════
export const passwordChangedTemplate = ({ firstName }) => {
  const content = `
    <h2 style="color:${BRAND.black};font-size:24px;margin:0 0 16px;font-weight:600;">
      🔐 Password Successfully Changed
    </h2>
    
    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName}, your ALPHA password was just changed.
    </p>

    <div style="background:#fff8e1;border-left:4px solid #ffd54f;padding:16px;border-radius:8px;margin:16px 0;">
      <p style="margin:0;color:#666;font-size:14px;">
        ⚠️ If you didn't make this change, please contact your admin immediately.
      </p>
    </div>

    ${button("Log In", `${FRONTEND_URL}/login`)}
  `;
  
  return emailWrapper(content);
};

// ═══════════════════════════════════════════════════════════════
// 📅 CLASS REMINDER
// ═══════════════════════════════════════════════════════════════
export const classReminderTemplate = ({
  firstName,
  classTitle,
  classDescription,
  scheduledAt,
  meetingLink,
  when,
  dashboardUrl,
}) => {
  const date = new Date(scheduledAt);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const timeLabel = when === "24h" ? "in 24 hours" : "in 1 hour";
  const headerEmoji = when === "24h" ? "⏰" : "🔔";

  const content = `
    <div style="text-align:center;">
      <div style="font-size:64px;margin:0 0 16px;">${headerEmoji}</div>
      <h2 style="color:${BRAND.black};font-size:28px;margin:0 0 8px;font-weight:600;">
        Class Reminder
      </h2>
      <p style="color:${BRAND.green};font-size:22px;font-weight:700;margin:0 0 8px;">
        ${classTitle}
      </p>
      <p style="color:${BRAND.gray};font-size:14px;margin:0 0 24px;">
        Starting ${timeLabel}
      </p>
    </div>

    <p style="color:${BRAND.gray};font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi ${firstName}, just a friendly heads up that your class is coming up!
    </p>

    <div style="background:${BRAND.lightGray};padding:24px;border-radius:12px;margin:24px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:${BRAND.gray};font-size:13px;font-weight:700;">📅 DATE</td>
          <td style="padding:8px 0;color:${BRAND.black};font-size:14px;text-align:right;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:${BRAND.gray};font-size:13px;font-weight:700;border-top:1px solid #ddd;">🕒 TIME</td>
          <td style="padding:8px 0;color:${BRAND.black};font-size:14px;text-align:right;border-top:1px solid #ddd;">${timeStr}</td>
        </tr>
        ${classDescription ? `
        <tr>
          <td colspan="2" style="padding:12px 0 0;color:${BRAND.gray};font-size:13px;font-weight:700;border-top:1px solid #ddd;">
            📝 DETAILS
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px 0 0;color:${BRAND.black};font-size:14px;line-height:1.6;">
            ${classDescription}
          </td>
        </tr>
        ` : ""}
      </table>
    </div>

    ${meetingLink ? button("Join Class", meetingLink, BRAND.blue) : button("Go to Dashboard", dashboardUrl)}

    <p style="color:${BRAND.gray};font-size:12px;margin:24px 0 0;text-align:center;">
      Don't miss out — see you there! 🚀
    </p>
  `;

  return emailWrapper(content);
};