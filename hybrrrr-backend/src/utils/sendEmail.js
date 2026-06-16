import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || "ALPHA <noreply@alpha.hybrgroup.net>";
const REPLY_TO = process.env.EMAIL_REPLY_TO || "support@hybrgroup.net";

// Strip HTML to create plain text version
const htmlToText = (html) => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
};

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      reply_to: REPLY_TO,
      subject,
      html,
      text: text || htmlToText(html),
      headers: {
        "List-Unsubscribe": `<mailto:${REPLY_TO}?subject=unsubscribe>, <https://alpha.hybrgroup.net/unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Entity-Ref-ID": `alpha-${Date.now()}`,
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