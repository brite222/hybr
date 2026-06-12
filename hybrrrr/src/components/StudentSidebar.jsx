import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import hybrMarkColor from "../assets/logos/hybr-mark-color.png";
import NotificationBell from "./NotificationBell";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const CoursesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ResourcesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const GradesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" /><line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);
const TrophyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function StudentSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navAndClose = (path) => {
    navigate(path);
    onClose && onClose();
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const avatarUrl = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile-picture/${user.profilePicture}`
    : null;

  return (
    <aside className={`dashboard-sidebar module-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-logo" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="sidebar-alpha">ALPHA</div>
          <div className="sidebar-by">
            BY <img src={hybrMarkColor} alt="" className="sidebar-hybr-mark" />
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="sidebar-nav">
        <button className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`} onClick={() => navAndClose("/dashboard")}>
          <DashboardIcon /><span>My Dashboard</span>
        </button>
        <button className={`sidebar-link ${isActive("/my-courses") || isActive("/courses") || isActive("/week") ? "active" : ""}`} onClick={() => navAndClose("/my-courses")}>
          <CoursesIcon /><span>My Courses</span>
        </button>
        <button className={`sidebar-link ${isActive("/resources") ? "active" : ""}`} onClick={() => navAndClose("/resources")}>
          <ResourcesIcon /><span>My Resources</span>
        </button>
        <button className={`sidebar-link ${isActive("/my-grades") ? "active" : ""}`} onClick={() => navAndClose("/my-grades")}>
          <GradesIcon /><span>My Grades</span>
        </button>
        <button className={`sidebar-link ${isActive("/achievements") ? "active" : ""}`} onClick={() => navAndClose("/achievements")}>
          <TrophyIcon /><span>My Achievements</span>
        </button>
      </nav>

      <div
        className="sidebar-user"
        onClick={() => navAndClose("/profile")}
        style={{ cursor: "pointer", transition: "background 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        title="View profile"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "2px solid #8DC540",
            }}
          />
        ) : (
          <UserIcon />
        )}

        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.firstName || "FirstName"}</div>
          <div className="sidebar-user-name">{user?.lastName || "LastName"}</div>
        </div>

        <button
          className="sidebar-logout"
          onClick={(e) => {
            e.stopPropagation();
            handleLogout();
          }}
        >
          <LogoutIcon />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}