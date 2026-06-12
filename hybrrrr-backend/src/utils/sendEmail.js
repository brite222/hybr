import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender — works out of the box using Resend's test domain
const FROM = process.env.EMAIL_FROM || "ALPHA <onboarding@resend.dev>";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
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