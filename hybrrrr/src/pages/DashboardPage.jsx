import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/dashboard.css";
import courseThumb from "../assets/images/hand.png";
import alphaLogo from "../assets/images/alpha-loggo.png";

// ── Icons ────────
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const GradCapIcon = () => (
  <svg width="22" height="20" viewBox="0 0 48 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.2045 12.176L24.7045 0.176C24.4875 0.0604402 24.2454 0 23.9995 0C23.7537 0 23.5116 0.0604402 23.2945 0.176L0.794531 12.176C0.554539 12.3039 0.353832 12.4946 0.213881 12.7278C0.07393 12.961 0 13.2278 0 13.4998C0 13.7717 0.07393 14.0385 0.213881 14.2717C0.353832 14.5049 0.554539 14.6956 0.794531 14.8235L5.99953 17.6004V26.6791C5.99797 27.4159 6.26914 28.1272 6.76078 28.676C9.21703 31.4116 14.7202 35.9998 23.9995 35.9998C27.0763 36.0252 30.1301 35.4679 32.9995 34.3573V40.4998C32.9995 40.8976 33.1576 41.2791 33.4389 41.5604C33.7202 41.8417 34.1017 41.9998 34.4995 41.9998C34.8974 41.9998 35.2789 41.8417 35.5602 41.5604C35.8415 41.2791 35.9995 40.8976 35.9995 40.4998V32.9079C37.9555 31.7787 39.7231 30.3509 41.2383 28.676C41.7299 28.1272 42.0011 27.4159 41.9995 26.6791V17.6004L47.2045 14.8235C47.4445 14.6956 47.6452 14.5049 47.7852 14.2717C47.9251 14.0385 47.9991 13.7717 47.9991 13.4998C47.9991 13.2278 47.9251 12.961 47.7852 12.7278C47.6452 12.4946 47.4445 12.3039 47.2045 12.176ZM23.9995 32.9998C15.8864 32.9998 11.1145 29.036 8.99953 26.6791V19.1997L23.2945 26.8235C23.5116 26.9391 23.7537 26.9995 23.9995 26.9995C24.2454 26.9995 24.4875 26.9391 24.7045 26.8235L32.9995 22.4004V31.0891C30.637 32.1916 27.6595 32.9998 23.9995 32.9998ZM38.9995 26.6716C38.1004 27.6694 37.0943 28.5654 35.9995 29.3435V20.7991L38.9995 19.1997V26.6716ZM35.2495 17.801L35.2083 17.7766L24.7083 12.176C24.358 11.9971 23.9514 11.9629 23.5761 12.0809C23.2008 12.1989 22.8869 12.4595 22.702 12.8067C22.5171 13.1539 22.476 13.5599 22.5875 13.9371C22.699 14.3143 22.9543 14.6327 23.2983 14.8235L32.062 19.4998L23.9995 23.7991L4.68703 13.4998L23.9995 3.20038L43.312 13.4998L35.2495 17.801Z" fill="white"/>
  </svg>
);
const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4FC2F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const TrophyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4FC2F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Progress Ring (dark variant for hero) ──
function ProgressRing({ percent, size = 90, strokeWidth = 8, dark = false, color: customColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = customColor || (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#E74C3C");
  const trackColor = dark ? "rgba(255,255,255,0.15)" : "#E5E5E5";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 700,
        fontSize: size > 90 ? 22 : 14,
        color: dark ? "#fff" : "#000",
      }}>
        {percent}%
      </div>
    </div>
  );
}

// ── Status pill ──
const StatusPill = ({ type, text }) => {
  const styles = {
    "in-progress": { bg: "#196AB4", color: "#fff" },
    complete: { bg: "#8DC540", color: "#fff" },
    "on-track": { bg: "#8DC540", color: "#fff" },
    "off-track": { bg: "#F0AD4E", color: "#fff" },
  };
  const s = styles[type] || styles.complete;
  return (
    <span style={{
      padding: "5px 14px",
      borderRadius: 4,
      background: s.bg,
      color: s.color,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Montserrat, sans-serif",
      whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/program"),
      api.get("/badges/me").catch(() => ({ data: { earned: [] } })),
    ])
      .then(([programRes, badgesRes]) => {
        setProgram(programRes.data);
        const earned = badgesRes.data.earned || badgesRes.data || [];
        setAchievements(earned.slice(0, 3));
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const currentWeek = program?.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];
  const daysSinceStart = program?.daysSinceStart ?? 0;
  const hasStarted = daysSinceStart >= 7;

  const totalCompleted = program?.weeks?.reduce((sum, w) => sum + (w.completedCount || 0), 0) || 0;
  const totalLessons = (program?.weeks?.length || 8) * 8;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100)
    : 0;

  const formatKickoffDate = () => {
    if (!program?.cohort?.startDate) return "";
    const date = new Date(program.cohort.startDate);
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase();
  };

  return (
    <div className="module-page">
      {/* Mobile header */}
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">
          <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
        </div>
        <button
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
      </div>

      <div
        className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        {/* ── TOP PROGRESS BAR ── */}
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {currentWeek}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">{currentWeekData?.title?.toUpperCase() || ""} PHASE</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar">
              <div className="module-progress-fill" style={{ width: `${topProgress}%` }} />
            </div>
            <span className="module-progress-text">{topProgress}%</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>
            Loading your dashboard...
          </div>
        ) : error ? (
          <div style={{ padding: 80, textAlign: "center", color: "#cc0000" }}>
            <h2>Oops! 😕</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* ── DARK WELCOME HERO CARD ── */}
            <div className="student-hero">
              <div className="student-hero-content">
                <h1 className="student-hero-title">
                  Welcome back, {user?.firstName || "FirstName"}! 👋
                </h1>
                <p className="student-hero-text">
                  Keep learning. Keep growing. Lorem ipsum dolor sit amet.
                </p>
              </div>
              <ProgressRing percent={overallProgress} size={100} strokeWidth={9} dark color="#8DC540" />
            </div>

            {/* ── KICK-OFF BANNER (hidden after Week 1) ── */}
            {!hasStarted && (
              <div className="kickoff-banner">
                <span className="kickoff-emoji">🚀</span>
                <div className="kickoff-content">
                  <div className="kickoff-title">KICK-OFF!</div>
                  <div className="kickoff-date">
                    ONBOARDING: {formatKickoffDate()}
                  </div>
                </div>
                <span className="kickoff-emoji">🚀</span>
              </div>
            )}

            {/* ── MY COURSES CARD ── */}
            <div className="dash-section-card">
              <div className="dash-section-header">
                <BookIcon />
                <h2 className="dash-section-title">My Courses</h2>
                <button
                  className="dash-section-link"
                  onClick={() => navigate("/courses/overview")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "#F5F5F5",
                    border: "none",
                    borderRadius: 100,
                    cursor: "pointer",
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: "#000",
                  }}
                >
                  View All
                </button>
              </div>
              <p className="dash-section-sub">
                Your enrolled programs and current standing.
              </p>

              {/* ── HERO COURSE CARD with background image ── */}
              <div
                className="course-hero-card"
                onClick={() => navigate("/courses/overview")}
                style={{ backgroundImage: `url(${courseThumb})` }}
              >
                <div className="course-hero-overlay" />
                <div className="course-hero-content">
                  <div className="course-hero-status">
                    {overallProgress >= 100 ? "COMPLETE" : "IN PROGRESS"}
                  </div>
                  <h3 className="course-hero-title">
                    {program?.cohort?.name || "ALPHA 2026 Summer"}
                    <span className="course-hero-icon"><GradCapIcon /></span>
                  </h3>
                  <p className="course-hero-sub">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
                <div className="course-hero-ring">
                  <ProgressRing percent={overallProgress} size={90} strokeWidth={8} dark color="#8DC540" />
                </div>
              </div>

              {/* Mobile-only bottom VIEW ALL pill */}
              <button
                className="dash-section-link-bottom"
                onClick={() => navigate("/courses/overview")}
              >
                <EyeIcon /> VIEW ALL
              </button>
            </div>

            {/* ── MY ACHIEVEMENTS CARD ── */}
            <div className="dash-section-card">
              <div className="dash-section-header">
                <TrophyIcon />
                <h2 className="dash-section-title">My Achievements</h2>
                <button
                  className="dash-section-link"
                  onClick={() => navigate("/achievements")}
                >
                  View all →
                </button>
              </div>
              <p className="dash-section-sub">
                Badges you've earned along your journey.
              </p>

              {achievements.length === 0 ? (
                <div className="achievements-empty">
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
                  <div>Start completing lessons to earn your first achievement!</div>
                </div>
              ) : (
                <div className="achievements-grid">
                  {achievements.map((a, idx) => (
                    <div key={a.id || idx} className="achievement-item">
                      <div className="achievement-icon">
                        {a.icon || "🏆"}
                      </div>
                      <div className="achievement-name">{a.name || "Achievement"}</div>
                      <div className="achievement-desc">
                        {a.description || "Lorem ipsum dolor sit amet."}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile-only bottom VIEW ALL pill */}
              <button
                className="dash-section-link-bottom"
                onClick={() => navigate("/achievements")}
              >
                <EyeIcon /> VIEW ALL
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}