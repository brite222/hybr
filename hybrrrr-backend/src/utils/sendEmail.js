import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "ALPHA <onboarding@resend.dev>";

// Helper: strip HTML to create plain text version
const htmlToText = (html) => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: text || htmlToText(html), // ✅ Auto-generate plain text
      headers: {
        'List-Unsubscribe': '<mailto:noreply@alpha.hybrgroup.net?subject=unsubscribe>',
      },
    });

    if (error) {
      console.error("❌ Resend error:", error);
      throw new Error(error.message || "Resend send failed");
    }

    console.log(`✅ Email sent to ${to} (id: ${data?.id})`);
    return data;
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    throw err;
  }
};