import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/login.css";
import loginBg from "../assets/images/login-img.jpg";
import hybrMarkColor from "../assets/logos/hybr-mark-color.png";
import sevenEduLogo from "../assets/logos/7Edu.png";

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFirstLogin = user?.mustChangePassword;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.newPassword === formData.currentPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      await refreshUser();

      if (user?.role === "admin") navigate("/admin/dashboard");
      else if (user?.role === "coach") navigate("/coach/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT — same image panel as LoginPage */}
      <div className="login-left">
        <img src={loginBg} alt="" className="login-bg" />
        <div className="login-left-content">
          <div className="login-brand">
            <span className="login-alpha">ALPHA</span>
            <span className="login-by">
              BY <img src={hybrMarkColor} alt="" className="login-hybr-mark" />
              <span className="login-by-text">HYBR</span>
            </span>
          </div>
          <p className="login-tagline">
            Explore real-world problems, discover insights, build solutions,
            create prototypes, and present your ideas with confidence.
          </p>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={hybrMarkColor} alt="" style={{ width: 48, height: 48 }} />
          </div>

          <h1 className="login-title">
            {isFirstLogin ? "Welcome to ALPHA!" : "Change Password"}
          </h1>
          <p className="login-subtitle">
            {isFirstLogin
              ? "For security, please set a new password before continuing."
              : "Update your account password."}
          </p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>{isFirstLogin ? "TEMPORARY PASSWORD" : "CURRENT PASSWORD"}</label>
              <div className="password-input-wrap">
                <input
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="password-toggle"
                  onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label>NEW PASSWORD</label>
              <div className="password-input-wrap">
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button type="button" className="password-toggle"
                  onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="login-field">
              <label>CONFIRM NEW PASSWORD</label>
              <div className="password-input-wrap">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button type="button" className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>

          <div className="login-footer">
            <div className="login-footer-brand">
              <img src={hybrMarkColor} alt="" className="login-footer-logo" />
              <span className="login-footer-text">HYBR</span>
            </div>
            <img src={sevenEduLogo} alt="7Edu" className="login-footer-7edu" />
          </div>
        </div>
      </div>
    </div>
  );
}