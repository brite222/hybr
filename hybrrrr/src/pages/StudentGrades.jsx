import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/student-grades.css";
import alphaLogo from "../assets/images/alpha-loggo.png";

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function ProgressRing({ percent, size = 70, strokeWidth = 7 }) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;
  const color = safePercent >= 75 ? "#8DC540" : safePercent >= 40 ? "#F0AD4E" : "#E74C3C";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E5E5" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif", fontWeight: 700,
        fontSize: size > 80 ? 20 : 13,
        color: safePercent === 0 ? "#999" : "#000",
      }}>
        {safePercent}%
      </div>
    </div>
  );
}

const StatusPill = ({ type, text }) => {
  const styles = {
    submitted: { bg: "#8DC540", color: "#fff" },
    "not-started": { bg: "#D5D5D5", color: "#666" },
    ungraded: { bg: "#D5D5D5", color: "#666" },
    graded: { bg: "#8DC540", color: "#fff" },
  };
  const s = styles[type] || styles.ungraded;
  return (
    <span className="status-pill" style={{
      padding: "5px 12px", borderRadius: 4,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
      display: "inline-block", minWidth: 90, textAlign: "center", whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
};

export default function StudentGrades() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ submissions: [], by_week: {}, total: 0, currentWeek: 1 });
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/program/my-grades"),
      api.get("/program").catch(() => ({ data: null })),
    ])
      .then(([gradesRes, programRes]) => {
        setData(gradesRes.data);
        setProgram(programRes.data);
        if (gradesRes.data.currentWeek) {
          setExpandedWeeks({ [gradesRes.data.currentWeek]: true });
        }
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load grades"))
      .finally(() => setLoading(false));
  }, []);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const gradedSubs = data.submissions.filter(s => s.is_graded);
  const overallAvg = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + s.percent, 0) / gradedSubs.length)
    : 0;

  const tier = user?.tier || "standard";
  const tierColor = tier === "premium" ? "#648C2D" : "#196AB4";
  const currentWeek = data.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100) : 0;

  // ── Build all weeks ──
  const allWeeks = Object.values(CURRICULUM).map(week => {
    const weekSubs = data.by_week?.[week.weekNumber] || [];
    const gradeableLessons = week.lessons.filter(l =>
      l.type === "upload" || l.type === "quiz" || l.type === "feedback"
    );

    const assignments = gradeableLessons.map(lesson => {
      const sub = weekSubs.find(s => s.lesson_id === lesson.id);
      return { title: lesson.title, lessonId: lesson.id, submission: sub || null };
    });

    const gradedA = assignments.filter(a => a.submission?.is_graded);
    const weekAvg = gradedA.length > 0
      ? Math.round(gradedA.reduce((sum, a) => sum + a.submission.percent, 0) / gradedA.length)
      : 0;

    return {
      weekNumber: week.weekNumber,
      title: week.title,
      assignments,
      weekAvg,
    };
  });

  // ── Sort: current week FIRST, then rest in natural order ──
  const sortedWeeks = [...allWeeks].sort((a, b) => {
    if (a.weekNumber === currentWeek) return -1;
    if (b.weekNumber === currentWeek) return 1;
    return a.weekNumber - b.weekNumber;
  });

  // ✅ FIXED: Always navigate to detail page (submitted OR not)
  const handleRowClick = (weekNum, assignment) => {
    const path = `/my-grades/${weekNum}/${assignment.lessonId}`.replace(/\/+/g, '/');
    navigate(path);
  };

  return (
    <div className="module-page">
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">
          <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
        </div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        {/* TOP PROGRESS BAR */}
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
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading your grades...</div>
        ) : error ? (
          <div style={{ padding: 80, textAlign: "center", color: "#cc0000" }}>
            <h2>Oops! 😕</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* ── TIER / My Average ── */}
            <div className="grades-tier-card">
              <div className="grades-tier-text">
                <div className="grades-tier-label" style={{ color: tierColor }}>
                  {tier.toUpperCase()} TIER
                </div>
                <h1 className="grades-tier-title">My Average</h1>
              </div>
              <ProgressRing percent={overallAvg} size={90} strokeWidth={8} />
            </div>

            {/* ── PER-WEEK CARDS ── */}
            {sortedWeeks.map((week) => {
              const isCurrent = week.weekNumber === currentWeek;
              const isExpanded = expandedWeeks[week.weekNumber];

              return (
                <div key={week.weekNumber} className={`grades-week-card ${isCurrent ? "current-week" : ""}`}>
                  {/* Mobile-only VIEW pill (top-right when collapsed) */}
                  {!isExpanded && (
                    <button
                      className="grades-week-view-pill"
                      onClick={() => toggleWeek(week.weekNumber)}
                    >
                      <EyeIcon /> VIEW
                    </button>
                  )}

                  <div
                    className="grades-week-header"
                    onClick={() => toggleWeek(week.weekNumber)}
                  >
                    <div className="grades-week-text">
                      <div className="grades-week-label" style={{
                        color: isCurrent ? "#648C2D" : "#196AB4",
                      }}>
                        {isCurrent ? "CURRENT WEEK: " : ""}{week.title.toUpperCase()}
                      </div>
                      <h2 className="grades-week-title">Week {week.weekNumber}</h2>
                    </div>
                    <ProgressRing percent={week.weekAvg} size={70} strokeWidth={7} />
                  </div>

                  {isExpanded && (
                    <div className="grades-week-body">
                      {week.assignments.length === 0 ? (
                        <div className="grades-week-empty">
                          No assignments in this week.
                        </div>
                      ) : (
                        week.assignments.map((a) => {
                          const sub = a.submission;
                          const isSubmitted = !!sub;
                          const isGraded = sub?.is_graded;
                          const percent = isGraded ? sub.percent : 0;

                          return (
                            <div
                              key={a.lessonId}
                              className="grades-assignment-row"
                              onClick={() => handleRowClick(week.weekNumber, a)}
                              style={{ cursor: "pointer" }}  // ✅ FIXED: always pointer
                            >
                              <div className="grades-assignment-title">{a.title}</div>
                              <div className="grades-assignment-status">
                                <StatusPill
                                  type={isSubmitted ? "submitted" : "not-started"}
                                  text={isSubmitted ? "SUBMITTED" : "NOT STARTED"}
                                />
                              </div>
                              <div className="grades-assignment-percent" style={{
                                color: isGraded ? (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#999") : "#999",
                              }}>
                                {isGraded ? `${percent}%` : "—"}
                              </div>
                              <div className="grades-assignment-grade">
                                <StatusPill
                                  type={isGraded ? "graded" : "ungraded"}
                                  text={isGraded ? "GRADED" : "UNGRADED"}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Chevron — visible only on desktop or when expanded */}
                  <div className="grades-week-chevron">
                    <button
                      onClick={() => toggleWeek(week.weekNumber)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: 4,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronDown />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}