import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/coach.css";
import hybrMarkColor from "../../assets/logos/hybr-mark-color.png";
import alphaLogo from "../../assets/images/alpha-loggo.png";
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const StudentsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const GradingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function CoachLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/coach/dashboard", label: "My Dashboard", icon: <DashboardIcon /> },
    { path: "/coach/students", label: "My Students", icon: <StudentsIcon /> },
    { path: "/coach/grading", label: "My Grading", icon: <GradingIcon /> },
  ];

  const navAndClose = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Build avatar URL
  const avatarUrl = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile-picture/${user.profilePicture}`
    : null;

  return (
    <div className="coach-page">
      {/* Mobile top header */}
      <div className="coach-mobile-header">
        <div className="coach-mobile-header-logo">ALPHA</div>
        <button
          className="coach-mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`coach-mobile-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`coach-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="coach-sidebar-logo">
          <img src={alphaLogo} alt="ALPHA by HYBR" className="sidebar-logo-img" />
        </div>

        <nav className="coach-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`coach-nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navAndClose(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Clickable user block → goes to /profile ── */}
        <div
          className="coach-user"
          onClick={() => navAndClose("/profile")}
          style={{ cursor: "pointer" }}
          title="View profile"
        >
          <div className="coach-user-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <UserIcon />
            )}
          </div>
          <div className="coach-user-info">
            <div className="coach-user-name">
              {user?.firstName} {user?.lastName?.charAt(0)}.
            </div>
            <div className="coach-user-role">COACH</div>
          </div>
          <button
            className="coach-logout"
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering profile navigation
              handleLogout();
            }}
            title="Log out"
          >
            <LogoutIcon />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <main className="coach-main">{children}</main>
    </div>
  );
}