import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";
import loginBg from "../assets/images/login-img.jpg";
import hybrMarkColor from "../assets/logos/hybr-mark-color.png";
import sevenEduLogo from "../assets/logos/7Edu.png";

// Eye icons for password toggle
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await login(formData.email, formData.password);
    
    // ✅ NEW: Force password change on first login
    if (result.user.mustChangePassword) {
      navigate("/change-password");
      return;
    }
    
    // Redirect based on user role
    if (result.user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (result.user.role === "coach") {
      navigate("/coach/dashboard");
    } else {
      navigate("/dashboard");
    }
  }
  catch (err) {
  if (err.response?.data?.message) {
    setError(err.response.data.message);
  } else if (err.message === "Network Error") {
    setError("Cannot reach the server. Is the backend running?");
  } else {
    setError(err.message || "Login failed. Try again.");
  }
}
   finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      {/* LEFT */}
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

      {/* RIGHT */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h1 className="login-title">Welcome back!</h1>
          <p className="login-subtitle">Log in to continue your learning journey.</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">EMAIL</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="janedoe@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">PASSWORD</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="login-extras">
              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Logging in..." : "Submit"}
            </button>
          </form>

          <p className="login-switch">
            Don't have an account?{" "}
            <Link to="/register" className="login-link">Sign up</Link>
          </p>

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