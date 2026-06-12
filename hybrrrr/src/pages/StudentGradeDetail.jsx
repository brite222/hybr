import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

function ProgressRing({ percent, size = 90, strokeWidth = 8 }) {
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
        fontSize: 20,
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
    }}>
      {text}
    </span>
  );
};

// ── Pretty Yes/No/Pending tag ──
const YesNoTag = ({ value }) => {
  if (value === true) {
    return (
      <span style={{
        padding: "5px 12px",
        borderRadius: 4,
        background: "#8DC540",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.2,
        fontFamily: "Montserrat, sans-serif",
      }}>
        YES
      </span>
    );
  }
  if (value === false) {
    return (
      <span style={{
        padding: "5px 12px",
        borderRadius: 4,
        background: "#C0392B",
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1.2,
        fontFamily: "Montserrat, sans-serif",
      }}>
        NO
      </span>
    );
  }
  return (
    <span style={{
      padding: "5px 12px",
      borderRadius: 4,
      background: "#EDEDED",
      color: "#666",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1.2,
      fontFamily: "Montserrat, sans-serif",
    }}>
      PENDING
    </span>
  );
};

export default function StudentGradeDetail() {
  const { weekNumber, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({ submissions: [], by_week: {}, currentWeek: 1 });
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/program/my-grades"),
      api.get("/program").catch(() => ({ data: null })),
    ])
      .then(([gradesRes, programRes]) => {
        setData(gradesRes.data);
        setProgram(programRes.data);
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const week = parseInt(weekNumber);
  const weekData = CURRICULUM[week];
  const weekSubs = data.by_week?.[week] || [];
  const submission = weekSubs.find(s => s.lesson_id === lessonId);
  const lessonInfo = weekData?.lessons.find(l => l.id === lessonId);

  // Overall avg
  const gradedSubs = data.submissions.filter(s => s.is_graded);
  const overallAvg = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + s.percent, 0) / gradedSubs.length)
    : 0;

  const tier = user?.tier || "standard";
  const tierColor = tier === "premium" ? "#648C2D" : "#196AB4";
  const currentWeek = data.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  // Top progress bar
  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100)
    : 0;

  const isGraded = submission?.is_graded;
  const percent = isGraded ? submission.percent : 0;

  // Bonus / penalty info (always defined, defaults to 0)
  const criteriaTotal = submission?.criteria_total ?? 0;
  const officeHoursPoints = submission?.office_hours_points ?? 0;
  const presentationPoints = submission?.presentation_points ?? 0;
  const totalScore = submission?.total_score ?? 0;
  const maxScore = submission?.max_score ?? 32;

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

        {/* ── BACK BUTTON ── */}
        <button
          onClick={() => navigate("/my-grades")}
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
          <ArrowLeft /> Back to My Grades
        </button>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: 80, textAlign: "center", color: "#cc0000" }}>{error}</div>
        ) : !submission ? (
          <div style={{
            background: "#fff",
            padding: 60,
            borderRadius: 16,
            textAlign: "center",
            color: "#888",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ fontFamily: "Raleway", color: "#000" }}>Submission not found</h3>
            <p>This assignment hasn't been submitted yet.</p>
          </div>
        ) : (
          <>
            {/* ── My Average ── */}
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

            {/* ── ASSIGNMENT ROW + BIG BUTTON ── */}
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 80px 110px",
                alignItems: "center",
                gap: 12,
                padding: "8px 12px",
                marginBottom: 16,
              }}>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#000",
                }}>
                  {lessonInfo?.title || "Work Assignment"}
                </div>
                <div style={{ textAlign: "center" }}>
                  <StatusPill type="submitted" text="SUBMITTED" />
                </div>
                <div style={{
                  textAlign: "center",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: isGraded ? (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#999") : "#999",
                }}>
                  {isGraded ? `${percent}%` : "—"}
                </div>
                <div style={{ textAlign: "center" }}>
                  <StatusPill
                    type={isGraded ? "graded" : "ungraded"}
                    text={isGraded ? "GRADED" : "UNGRADED"}
                  />
                </div>
              </div>

              <button
                disabled
                style={{
                  width: "100%",
                  padding: 16,
                  background: "#EDEDED",
                  color: "#666",
                  border: "none",
                  borderRadius: 100,
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "not-allowed",
                }}
              >
                Assignment Submitted
              </button>
            </div>

            {/* ── ASSIGNMENT TITLE + DESCRIPTION + RUBRIC ── */}
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
                margin: "0 0 12px 0",
                color: "#000",
              }}>
                {lessonInfo?.title || "Assignment Title, Lorem Ipsum Dolor"}
              </h2>
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
                color: "#666",
                lineHeight: 1.5,
                margin: "0 0 28px 0",
              }}>
                About the assignment. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Vestibulum aliquam tellus sit amet eros maximus gravida. Vestibulum sit amet nisl libero.
              </p>

              <h3 style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: 18,
                fontWeight: 600,
                margin: "0 0 16px 0",
                color: "#000",
              }}>
                Grading Rubric/Criteria
              </h3>

              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} style={{ marginBottom: 14 }}>
                  <div style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 1,
                    color: "#000",
                    marginBottom: 4,
                  }}>
                    CRITERION {n}
                  </div>
                  <div style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 13,
                    color: "#555",
                    lineHeight: 1.5,
                  }}>
                    Criteria Details. Aliquam dignissim, dui vel auctor congue, ipsum sem interdum magna.
                  </div>
                </div>
              ))}
            </div>

            {/* ── GRADING SECTION ── */}
            <div style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              marginBottom: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <h3 style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: 20,
                fontWeight: 600,
                margin: "0 0 20px 0",
                color: "#000",
              }}>
                Grading
              </h3>

              {/* 5 criterion cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 12,
                marginBottom: 24,
              }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    style={{
                      background: "#fff",
                      border: "1px solid #E5E5E5",
                      borderRadius: 10,
                      padding: "20px 8px",
                      textAlign: "center",
                      minHeight: 90,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "#666",
                      marginBottom: isGraded ? 12 : 0,
                    }}>
                      CRITERION {n}
                    </div>
                    {isGraded && (
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#000",
                        lineHeight: 1,
                      }}>
                        {submission[`criterion_${n}`] ?? "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── PARTICIPATION & PRESENTATION (always shows) ── */}
              <div style={{
                paddingTop: 20,
                marginBottom: 20,
                borderTop: "1px solid #f0f0f0",
              }}>
                <h4 style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  margin: "0 0 14px 0",
                  color: "#000",
                }}>
                  Participation & Presentation
                </h4>

                {/* Office Hours row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  border: "1px solid #EDEDED",
                  borderRadius: 10,
                  marginBottom: 10,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#000",
                    }}>
                      Attended Office Hours
                    </div>
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 11,
                      color: "#888",
                      marginTop: 2,
                    }}>
                      Yes = +2 pts &nbsp;•&nbsp; No = −2 pts
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isGraded && (
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: officeHoursPoints > 0 ? "#5a8a1a" : officeHoursPoints < 0 ? "#C0392B" : "#888",
                        minWidth: 36,
                        textAlign: "right",
                      }}>
                        {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
                      </span>
                    )}
                    <YesNoTag value={isGraded ? submission.attended_office_hours : null} />
                  </div>
                </div>

                {/* Presentation row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  border: "1px solid #EDEDED",
                  borderRadius: 10,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#000",
                    }}>
                      Presented
                    </div>
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 11,
                      color: "#888",
                      marginTop: 2,
                    }}>
                      Yes = +5 pts &nbsp;•&nbsp; No = 0 pts
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isGraded && (
                      <span style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: presentationPoints > 0 ? "#5a8a1a" : "#888",
                        minWidth: 36,
                        textAlign: "right",
                      }}>
                        {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
                      </span>
                    )}
                    <YesNoTag value={isGraded ? submission.presented : null} />
                  </div>
                </div>
              </div>

              {/* ── SCORE BREAKDOWN ── */}
              {isGraded && (
                <div style={{
                  padding: "18px 22px",
                  background: "#FAFAFA",
                  borderRadius: 12,
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 13,
                  color: "#333",
                  marginBottom: 24,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span>Criteria (1–5)</span>
                    <span style={{ fontWeight: 600 }}>{criteriaTotal} / 25</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span>Office Hours</span>
                    <span style={{ fontWeight: 600, color: officeHoursPoints < 0 ? "#C0392B" : "#000" }}>
                      {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span>Presentation</span>
                    <span style={{ fontWeight: 600 }}>
                      {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
                    </span>
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid #E5E5E5",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#000",
                  }}>
                    <span>Final Score</span>
                    <span>{totalScore} / {maxScore}</span>
                  </div>
                </div>
              )}

              {/* Coach Feedback */}
              <div>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 1,
                  color: "#000",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  COACH FEEDBACK
                  {isGraded && submission.coach_first_name && (
                    <span style={{ opacity: 0.6, fontWeight: 500, fontSize: 11 }}>
                      — {submission.coach_first_name} {submission.coach_last_name?.charAt(0)}.
                    </span>
                  )}
                </div>
                <div style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  color: isGraded ? "#333" : "#999",
                  fontStyle: isGraded ? "normal" : "italic",
                  lineHeight: 1.6,
                }}>
                  {isGraded ? (
                    submission.feedback || (
                      <span style={{ color: "#999", fontStyle: "italic" }}>
                        Nothing yet. Check back in a while.
                      </span>
                    )
                  ) : (
                    "Nothing yet. Check back in a while."
                  )}
                </div>

                {isGraded && submission.graded_at && (
                  <div style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 11,
                    color: "#999",
                    marginTop: 12,
                  }}>
                    Graded on {new Date(submission.graded_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}