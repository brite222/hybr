import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import { sendEmail } from "../utils/sendEmail.js";
import dotenv from "dotenv";
dotenv.config();

// Helper: Generate JWT
// Helper: Generate JWT (with safe fallback)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",  // ✅ fallback to 7 days
  });
};

// ─────────────────────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // Check if email exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Insert user
    const result = await pool.query(
      `INSERT INTO users 
       (first_name, last_name, email, password, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name`,
      [firstName, lastName, email, hashedPassword, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email — wrapped in try/catch so registration still works if email fails
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to ALPHA! Verify your email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8DC540;">Welcome to ALPHA, ${firstName}!</h1>
            <p>Thanks for signing up. Please verify your email by clicking the button below:</p>
            <a href="${verifyUrl}" 
               style="display: inline-block; padding: 14px 28px; background: #8DC540; color: #000; 
                      text-decoration: none; border-radius: 100px; font-weight: 600; margin: 20px 0;">
              Verify Email
            </a>
            <p>Or copy and paste this link: <br>${verifyUrl}</p>
            <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
          </div>
        `,
      });
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailErr) {
      console.warn(`⚠️ Email failed to send (user still created): ${emailErr.message}`);
      console.warn(`📋 Manual verify URL: ${verifyUrl}`);
    }

    res.status(201).json({
      message: "Registration successful! Check your email to verify.",
      user: { id: user.id, email: user.email, firstName: user.first_name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isVerified: user.is_verified,
        mustChangePassword: user.must_change_password,
        cohortId: user.cohort_id,
        tier: user.tier,                       // ✅ added
        profilePicture: user.profile_picture,  // ✅ added
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
// ─────────────────────────────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Verification token required" });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM users 
       WHERE verification_token = $1 AND verification_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    await pool.query(
      `UPDATE users 
       SET is_verified = TRUE, verification_token = NULL, verification_expires = NULL 
       WHERE id = $1`,
      [result.rows[0].id]
    );

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ message: "Server error during verification" });
  }
};

// ─────────────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const result = await pool.query("SELECT id, first_name FROM users WHERE email = $1", [email]);
    
    // Always return success (security: don't reveal if email exists)
    if (result.rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link was sent." });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      `UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3`,
      [resetToken, resetExpires, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "ALPHA - Reset your password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Reset Your Password</h1>
            <p>Hi ${user.first_name}, click below to reset your password:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 14px 28px; background: #8DC540; color: #000; 
                      text-decoration: none; border-radius: 100px; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });
      console.log(`✅ Reset email sent to ${email}`);
    } catch (emailErr) {
      console.warn(`⚠️ Email failed: ${emailErr.message}`);
      console.warn(`📋 Manual reset URL: ${resetUrl}`);
    }

    res.json({ message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and new password required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
      `UPDATE users 
       SET password = $1, reset_token = NULL, reset_expires = NULL 
       WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    );

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT USER (PROTECTED)
// ─────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, role, is_verified, 
              must_change_password, cohort_id, tier, profile_picture, created_at 
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const u = result.rows[0];
    res.json({ 
      user: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        isVerified: u.is_verified,
        mustChangePassword: u.must_change_password,
        cohortId: u.cohort_id,
        tier: u.tier,                          // ✅ added
        profilePicture: u.profile_picture,     // ✅ added
        createdAt: u.created_at,
      }
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ─────────────────────────────────────────────────────────────
// CHANGE PASSWORD (FIRST LOGIN or VOLUNTARY)
// ─────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  try {
    const result = await pool.query("SELECT password FROM users WHERE id = $1", [req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2",
      [hashed, req.userId]
    );

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};