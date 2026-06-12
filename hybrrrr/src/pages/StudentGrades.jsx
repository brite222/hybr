import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";

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
    <span style={{
      padding: "5px 12px",
      borderRadius: 4,
      background: s.bg,
      color: s.color,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Montserrat, sans-serif",
      display: "inline-block",
      minWidth: 90,
      textAlign: "center",
      whiteSpace: "nowrap",
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

  // ── Overall avg (out of 32-scale percent already from backend) ──
  const gradedSubs = data.submissions.filter(s => s.is_graded);
  const overallAvg = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + s.percent, 0) / gradedSubs.length)
    : 0;

  const tier = user?.tier || "standard";
  const tierColor = tier === "premium" ? "#648C2D" : "#196AB4";
  const currentWeek = data.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  // Top progress bar: current week's lesson completion
  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100)
    : 0;

  // Build all weeks
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

  const handleRowClick = (weekNum, assignment) => {
    if (assignment.submission) {
      const path = `/my-grades/${weekNum}/${assignment.lessonId}`.replace(/\/+/g, '/');
      navigate(path);
    }
  };

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
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading your grades...</div>
        ) : error ? (
          <div style={{ padding: 80, textAlign: "center", color: "#cc0000" }}>
            <h2>Oops! 😕</h2>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* ── TIER / My Average ── */}
            <div style={{
              background: "#fff",
              padding: "24px 32px",
              borderRadius: 16,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: 1.8,
                  color: tierColor,
                  marginBottom: 6,
                }}>
                  {tier.toUpperCase()} TIER
                </div>
                <h1 style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 600,
                  fontSize: 26,
                  margin: 0,
                  color: "#000",
                  lineHeight: 1.1,
                }}>
                  My Average
                </h1>
              </div>
              <ProgressRing percent={overallAvg} size={90} strokeWidth={8} />
            </div>

            {/* ── PER-WEEK CARDS ── */}
            {allWeeks.map((week) => {
              const isCurrent = week.weekNumber === currentWeek;
              const isExpanded = expandedWeeks[week.weekNumber];

              return (
                <div
                  key={week.weekNumber}
                  style={{
                    background: "#fff",
                    padding: "24px 28px",
                    borderRadius: 16,
                    marginBottom: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    onClick={() => toggleWeek(week.weekNumber)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      cursor: "pointer",
                      marginBottom: isExpanded ? 20 : 0,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "Raleway, sans-serif",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: 1.8,
                        color: isCurrent ? "#648C2D" : "#196AB4",
                        marginBottom: 4,
                      }}>
                        {isCurrent ? "CURRENT WEEK: " : ""}{week.title.toUpperCase()}
                      </div>
                      <h2 style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: 22,
                        fontWeight: 600,
                        margin: 0,
                        color: "#000",
                      }}>
                        Week {week.weekNumber}
                      </h2>
                    </div>
                    <ProgressRing percent={week.weekAvg} size={70} strokeWidth={7} />
                  </div>

                  {isExpanded && (
                    <div style={{ paddingTop: 4, borderTop: "1px solid #f0f0f0" }}>
                      {week.assignments.length === 0 ? (
                        <div style={{
                          padding: "20px 0",
                          textAlign: "center",
                          color: "#888",
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 13,
                        }}>
                          No assignments in this week.
                        </div>
                      ) : (
                        week.assignments.map((a, idx) => {
                          const sub = a.submission;
                          const isSubmitted = !!sub;
                          const isGraded = sub?.is_graded;
                          const percent = isGraded ? sub.percent : 0;

                          return (
                            <div
                              key={a.lessonId}
                              onClick={() => handleRowClick(week.weekNumber, a)}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 110px 80px 110px",
                                alignItems: "center",
                                gap: 12,
                                padding: "16px 0",
                                borderBottom: idx < week.assignments.length - 1 ? "1px solid #f5f5f5" : "none",
                                cursor: isSubmitted ? "pointer" : "default",
                                transition: "background 0.15s",
                                borderRadius: 8,
                                paddingLeft: 8,
                                paddingRight: 8,
                              }}
                              onMouseEnter={(e) => {
                                if (isSubmitted) e.currentTarget.style.background = "#f9f9f9";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <div style={{
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#000",
                              }}>
                                {a.title}
                              </div>

                              <div style={{ textAlign: "center" }}>
                                <StatusPill
                                  type={isSubmitted ? "submitted" : "not-started"}
                                  text={isSubmitted ? "SUBMITTED" : "NOT STARTED"}
                                />
                              </div>

                              <div style={{
                                textAlign: "center",
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 700,
                                fontSize: 14,
                                color: isGraded ? (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#999") : "#999",
                              }}>
                                {isGraded ? (
                                  <span title={`${sub.total_score} / ${sub.max_score} pts`}>
                                    {percent}%
                                  </span>
                                ) : "—"}
                              </div>

                              <div style={{ textAlign: "center" }}>
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

                  <div style={{ textAlign: "center", marginTop: 8 }}>
                    <button
                      onClick={() => toggleWeek(week.weekNumber)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
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