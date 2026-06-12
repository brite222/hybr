import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import CoachLayout from "./coach/CoachLayout";
import "../styles/module.css";

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Profile info state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  // Avatar state
  const [uploading, setUploading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const currentWeek = 6; // can be wired up via /program endpoint
  const currentWeekData = CURRICULUM[currentWeek];

  const isCoach = user?.role === "coach";
  const isAdmin = user?.role === "admin";

  // ── Form dirty check ──
  const isDirty = firstName !== user?.firstName || lastName !== user?.lastName;

  // ── Save name changes ──
  const handleSaveChanges = async () => {
    if (!isDirty) return;
    setSaving(true);
    setSavedMessage("");
    try {
      await api.patch("/users/me", { firstName, lastName });
      await refreshUser();
      setSavedMessage("✅ Changes saved");
      setTimeout(() => setSavedMessage(""), 3000);
    } catch (err) {
      setSavedMessage("❌ " + (err.response?.data?.message || "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload ──
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage("❌ Only image files allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage("❌ Image too large (max 5MB)");
      return;
    }

    setUploading(true);
    setAvatarMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setAvatarMessage("✅ Profile picture updated");
      setTimeout(() => setAvatarMessage(""), 3000);
    } catch (err) {
      setAvatarMessage("❌ " + (err.response?.data?.message || "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setPasswordChanging(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setPasswordMessage("✅ Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordChanging(false);
    }
  };

  // Build avatar URL
  const avatarUrl = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile-picture/${user.profilePicture}`
    : null;

  // ── The actual profile content (shared by all roles) ──
  const profileContent = (
    <>
      {/* ── BACK BUTTON ── */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "#196AB4",
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 500,
          padding: 0,
          marginBottom: 8,
          alignSelf: "flex-start",
        }}
      >
        <ArrowLeft /> Back
      </button>

      {/* ── HEADER: ROLE label + Save Changes button ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: "Raleway, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 2,
          color: isCoach ? "#196AB4" : isAdmin ? "#C0392B" : "#648C2D",
        }}>
          {(user?.role || "STUDENT").toUpperCase()}
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={!isDirty || saving}
          style={{
            padding: "10px 22px",
            background: isDirty ? "#8DC540" : "#D5D5D5",
            color: isDirty ? "#000" : "#666",
            border: "none",
            borderRadius: 6,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            cursor: isDirty ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {savedMessage && (
        <div style={{
          padding: 12,
          background: savedMessage.startsWith("✅") ? "#e6f7d6" : "#ffe6e6",
          color: savedMessage.startsWith("✅") ? "#5a8a1a" : "#cc0000",
          borderRadius: 8,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 14,
          marginBottom: 12,
        }}>
          {savedMessage}
        </div>
      )}

      {/* ── GENERAL USER INFO CARD ── */}
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 24,
          fontWeight: 600,
          margin: "0 0 24px 0",
          color: "#000",
        }}>
          General User Information
        </h2>

        <FormField label="YOUR FIRST NAME">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
          />
        </FormField>

        <FormField label="YOUR LAST NAME">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={inputStyle}
          />
        </FormField>

        <FormField label="YOUR EMAIL*">
          <input
            type="email"
            value={user?.email || ""}
            disabled
            style={{ ...inputStyle, background: "#FAFAFA", color: "#666", cursor: "not-allowed" }}
          />
        </FormField>
        <div style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 11,
          color: "#888",
          marginTop: -10,
          marginBottom: 18,
          paddingLeft: 4,
        }}>
          * Your email address cannot be changed.
        </div>

        {/* Only show TIER for students */}
        {!isCoach && !isAdmin && (
          <FormField label="YOUR TIER">
            <input
              type="text"
              value={(user?.tier || "standard").toUpperCase()}
              disabled
              style={{ ...inputStyle, background: "#FAFAFA", color: "#666", cursor: "not-allowed" }}
            />
          </FormField>
        )}
      </div>

      {/* ── PROFILE PICTURE CARD ── */}
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 16px 0",
          color: "#000",
        }}>
          Profile Picture
        </h2>

        {avatarUrl && (
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <img
              src={avatarUrl}
              alt="Profile"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #8DC540",
              }}
            />
          </div>
        )}

        {avatarMessage && (
          <div style={{
            padding: 10,
            background: avatarMessage.startsWith("✅") ? "#e6f7d6" : "#ffe6e6",
            color: avatarMessage.startsWith("✅") ? "#5a8a1a" : "#cc0000",
            borderRadius: 8,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            marginBottom: 12,
            textAlign: "center",
          }}>
            {avatarMessage}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: 14,
            background: "#fff",
            border: "1px solid #DDD",
            borderRadius: 10,
            cursor: uploading ? "not-allowed" : "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: "#000",
            transition: "background 0.2s",
          }}
        >
          <UploadIcon />
          <span>{uploading ? "Uploading..." : avatarUrl ? "Change Profile Picture" : "Upload An Image"}</span>
        </button>

        <div style={{
          marginTop: 16,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          color: "#666",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "#000", display: "block", marginBottom: 6 }}>
            Profile Picture Guidelines:
          </strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>JPG, PNG, or WebP format</li>
            <li>Maximum 5MB file size</li>
            <li>Square images work best (1:1 aspect ratio)</li>
            <li>Avoid sensitive or inappropriate content</li>
          </ul>
        </div>
      </div>

      {/* ── PASSWORD CARD ── */}
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 24px 0",
          color: "#000",
        }}>
          Password Information
        </h2>

        {passwordMessage && (
          <div style={{
            padding: 12,
            background: "#e6f7d6",
            color: "#5a8a1a",
            borderRadius: 8,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            marginBottom: 16,
          }}>
            {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div style={{
            padding: 12,
            background: "#ffe6e6",
            color: "#cc0000",
            borderRadius: 8,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            marginBottom: 16,
          }}>
            {passwordError}
          </div>
        )}

        <FormField label="CURRENT PASSWORD">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            style={inputStyle}
          />
        </FormField>

        <FormField label="NEW PASSWORD">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            style={inputStyle}
          />
        </FormField>

        <FormField label="CONFIRM NEW PASSWORD">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            style={inputStyle}
          />
        </FormField>

        <div style={{
          marginTop: 8,
          marginBottom: 24,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          color: "#666",
          lineHeight: 1.6,
        }}>
          <strong style={{ color: "#000", display: "block", marginBottom: 6 }}>
            Your Password Should Be:
          </strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>At least 6 characters long</li>
            <li>A mix of letters and numbers (recommended)</li>
            <li>Different from your current password</li>
            <li>Something only you would know</li>
          </ul>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={passwordChanging}
          style={{
            width: "100%",
            padding: 16,
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 100,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: passwordChanging ? "not-allowed" : "pointer",
            opacity: passwordChanging ? 0.6 : 1,
          }}
        >
          {passwordChanging ? "Changing..." : "Change Your Password"}
        </button>
      </div>
    </>
  );

  // ── COACH LAYOUT ──
  if (isCoach) {
    return <CoachLayout>{profileContent}</CoachLayout>;
  }

  // ── STUDENT LAYOUT (default; also used for admin until you build AdminLayout) ──
  return (
    <div className="module-page">
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">ALPHA</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        {/* ── TOP PROGRESS BAR (student only) ── */}
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {currentWeek}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">{currentWeekData?.title?.toUpperCase() || ""} PHASE</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar">
              <div className="module-progress-fill" style={{ width: `80%` }} />
            </div>
            <span className="module-progress-text">80%</span>
          </div>
        </div>

        {profileContent}
      </main>
    </div>
  );
}

// ── Reusable form field ──
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 1.2,
        color: "#000",
        marginBottom: 8,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  border: "1px solid #DDD",
  borderRadius: 100,
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  color: "#000",
  outline: "none",
  boxSizing: "border-box",
};