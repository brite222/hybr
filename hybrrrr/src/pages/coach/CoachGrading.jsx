import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CURRICULUM } from "../../data/curriculum";
import CoachLayout from "./CoachLayout";

const MAX_SCORE = 32; // 25 criteria + 2 office hours + 5 presentation

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Helper: compute percent from a submission row ──
function subPercent(sub) {
  if (!sub?.is_graded) return 0;
  const max = sub.max_score || MAX_SCORE;
  const score = sub.total_score ?? 0;
  return Math.max(0, Math.round((score / max) * 100));
}

// ── Progress Ring ──
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
        fontSize: size > 70 ? 16 : 13,
        color: "#000",
      }}>
        {safePercent}%
      </div>
    </div>
  );
}

// ── Status Badge ──
const StatusBadge = ({ type, text }) => {
  const styles = {
    submitted: { bg: "#8DC540", color: "#fff" },
    delayed:   { bg: "#C0392B", color: "#fff" },
    graded:    { bg: "#8DC540", color: "#fff" },
    ungraded:  { bg: "#D5D5D5", color: "#666" },
  };
  const s = styles[type] || styles.ungraded;
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
      display: "inline-block",
      minWidth: 90,
      textAlign: "center",
    }}>
      {text}
    </span>
  );
};

export default function CoachGrading() {
  const navigate = useNavigate();
  const [data, setData] = useState({ submissions: [], by_week: {} });
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    Promise.all([
      api.get("/coach/grading"),
      api.get("/coach/students"),
    ])
      .then(([gradingRes, studentsRes]) => {
        setData(gradingRes.data);
        const all = [...(studentsRes.data.premium || []), ...(studentsRes.data.standard || [])];
        if (all[0]?.current_week) {
          const week = parseInt(all[0].current_week);
          setCurrentWeek(week);
          setExpandedWeeks({ [week]: true });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  // ── Week status with AVERAGE SCORE (now using max_score / 32) ──
  const getWeekStatus = (weekNum) => {
    const submissions = data.by_week[weekNum] || [];
    if (submissions.length === 0) return { status: "no-submissions", progress: 0, total: 0, graded: 0 };

    const graded = submissions.filter(s => s.is_graded).length;
    const allGraded = graded === submissions.length;

    const gradedSubs = submissions.filter(s => s.is_graded);
    const avgScore = gradedSubs.length > 0
      ? Math.round(gradedSubs.reduce((sum, s) => sum + subPercent(s), 0) / gradedSubs.length)
      : 0;

    return {
      status: allGraded ? "complete" : graded > 0 ? "in-progress" : "pending",
      progress: avgScore,
      total: submissions.length,
      graded,
    };
  };

  // ── Overall average grade (out of 32) ──
  const gradedSubs = data.submissions.filter(s => s.is_graded);
  const avgProgress = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + subPercent(s), 0) / gradedSubs.length)
    : 0;

  // ── Reorder weeks: current week first ──
  const allWeeks = Object.values(CURRICULUM);
  const orderedWeeks = [
    ...allWeeks.filter(w => parseInt(w.weekNumber) === parseInt(currentWeek)),
    ...allWeeks.filter(w => parseInt(w.weekNumber) !== parseInt(currentWeek)),
  ];

  // ── Assignment badge ──
  const renderAssignmentBadge = (status) => {
    if (status === "complete") {
      return (
        <span style={{
          padding: "10px 22px", borderRadius: 6, background: "#8DC540", color: "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
        }}>
          GRADING COMPLETE
        </span>
      );
    }
    if (status === "in-progress") {
      return (
        <span style={{
          padding: "10px 22px", borderRadius: 6, background: "#196AB4", color: "#fff",
          fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
          fontFamily: "Montserrat, sans-serif",
        }}>
          GRADING IN PROGRESS
        </span>
      );
    }
    return (
      <span style={{
        padding: "10px 22px", borderRadius: 6, background: "#E5E5E5", color: "#888",
        fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
        fontFamily: "Montserrat, sans-serif",
      }}>
        PENDING
      </span>
    );
  };

  return (
    <CoachLayout>
      {/* ── TOP PROGRESS BAR ── */}
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        gap: 32,
        minHeight: 60,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: "Montserrat, sans-serif",
          flexShrink: 0, whiteSpace: "nowrap",
        }}>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1.5, color: "#000" }}>
            WEEK {currentWeek}
          </span>
          <span style={{ color: "#ccc", fontSize: 16 }}>•</span>
          <span style={{
            fontWeight: 600, fontSize: 14, letterSpacing: 1.5,
            textTransform: "uppercase", color: "#000",
          }}>
            {CURRICULUM[currentWeek]?.title || "Week"} PHASE
          </span>
        </div>

        <div style={{
          flex: 1, height: 10, background: "#e5e5e5",
          borderRadius: 5, overflow: "hidden", minWidth: 100,
        }}>
          <div style={{
            height: "100%", background: "#8DC540", borderRadius: 5,
            width: `${avgProgress}%`, transition: "width 0.5s ease",
          }} />
        </div>

        <span style={{
          fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16,
          minWidth: 50, textAlign: "right", color: "#000", flexShrink: 0,
        }}>
          {avgProgress}%
        </span>
      </div>

      {loading ? (
        <div className="coach-loading">Loading...</div>
      ) : (
        <>
          {orderedWeeks.map((week) => {
            const isCurrent = parseInt(week.weekNumber) === parseInt(currentWeek);
            const weekStatus = getWeekStatus(week.weekNumber);
            const isExpanded = expandedWeeks[week.weekNumber];
            const weekSubmissions = data.by_week[week.weekNumber] || [];
            const assignmentLesson = week.lessons.find(l => l.type === "upload");
            const assignmentTitle = assignmentLesson?.title || "Work Assignment";

            return (
              <div
                key={week.weekNumber}
                style={{
                  background: "#fff",
                  padding: 24,
                  borderRadius: 16,
                  marginBottom: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: isCurrent ? "1.5px dashed #196AB4" : "1px solid transparent",
                }}
              >
                {/* Week Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "Raleway, sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: 2,
                      marginBottom: 4,
                    }}>
                      {isCurrent ? (
                        <>
                          <span style={{ color: "#648C2D" }}>CURRENT WEEK: </span>
                          <span style={{ color: "#196AB4" }}>{week.title.toUpperCase()}</span>
                        </>
                      ) : (
                        <span style={{ color: "#196AB4" }}>{week.title.toUpperCase()}</span>
                      )}
                    </div>
                    <h2 style={{
                      fontFamily: "Raleway, sans-serif",
                      fontSize: 24,
                      fontWeight: 600,
                      margin: 0,
                      color: "#000",
                    }}>
                      Week {week.weekNumber}
                    </h2>
                  </div>

                  {isCurrent ? (
                    <ProgressRing percent={weekStatus.progress} size={70} strokeWidth={7} />
                  ) : (
                    <button style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      background: "#F5F5F5",
                      border: "none",
                      borderRadius: 100,
                      cursor: "pointer",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#000",
                    }}>
                      <EyeIcon />
                      VIEW
                    </button>
                  )}
                </div>

                {/* Assignment Header Row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  border: "1px solid #EDEDED",
                  borderRadius: 12,
                  marginBottom: 12,
                }}>
                  <div style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#000",
                  }}>
                    {assignmentTitle}
                  </div>
                  {renderAssignmentBadge(weekStatus.status)}
                </div>

                {/* Expandable Student Submissions with Rubric */}
                {isExpanded && weekSubmissions.length > 0 && (
                  <>
                    {/* ── ASSIGNMENT DETAILS + RUBRIC (only for current week) ── */}
                    {isCurrent && (
                      <div style={{
                        padding: "24px 24px",
                        marginTop: 12,
                        marginBottom: 16,
                        background: "#fff",
                        border: "1px solid #EDEDED",
                        borderRadius: 12,
                      }}>
                        <h3 style={{
                          fontFamily: "Raleway, sans-serif",
                          fontSize: 20,
                          fontWeight: 600,
                          margin: "0 0 8px 0",
                          color: "#000",
                        }}>
                          Assignment Title, Lorem Ipsum Dolor
                        </h3>
                        <p style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 14,
                          color: "#666",
                          lineHeight: 1.5,
                          margin: "0 0 24px 0",
                        }}>
                          About the assignment. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          Vestibulum aliquam tellus sit amet eros maximus gravida. Vestibulum sit amet nisl libero.
                        </p>

                        <h4 style={{
                          fontFamily: "Raleway, sans-serif",
                          fontSize: 18,
                          fontWeight: 600,
                          margin: "0 0 16px 0",
                          color: "#000",
                        }}>
                          Grading Rubric/Criteria
                        </h4>

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

                        {/* ── BONUS / PENALTY NOTE ── */}
                        <div style={{
                          marginTop: 16,
                          padding: "12px 16px",
                          background: "#FAFAFA",
                          borderRadius: 8,
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 12,
                          color: "#666",
                        }}>
                          <strong style={{ color: "#000" }}>Bonus/Penalty:</strong>{" "}
                          Office Hours: <strong style={{ color: "#5a8a1a" }}>+2</strong> /{" "}
                          <strong style={{ color: "#C0392B" }}>−2</strong> &nbsp;•&nbsp;
                          Presentation: <strong style={{ color: "#5a8a1a" }}>+5</strong> / 0
                          &nbsp;•&nbsp; Final score out of <strong>32</strong>
                        </div>
                      </div>
                    )}

                    {/* ── STUDENTS GROUPED BY TIER ── */}
                    {(() => {
                      const premium = weekSubmissions.filter(s => s.tier === "premium");
                      const standard = weekSubmissions.filter(s => s.tier !== "premium");

                      const renderStudentSection = (tier, label, list) => {
                        if (list.length === 0) return null;
                        return (
                          <div style={{
                            background: "#fff",
                            padding: 24,
                            borderRadius: 12,
                            border: "1px solid #EDEDED",
                            marginBottom: 12,
                          }}>
                            <div style={{
                              fontFamily: "Raleway, sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              letterSpacing: 2,
                              color: tier === "premium" ? "#648C2D" : "#196AB4",
                              marginBottom: 4,
                            }}>
                              {label}
                            </div>
                            <h3 style={{
                              fontFamily: "Raleway, sans-serif",
                              fontSize: 22,
                              fontWeight: 600,
                              margin: "0 0 16px 0",
                              color: "#000",
                            }}>
                              My Students
                            </h3>

                            {list.map((sub) => {
                              const scorePercent = subPercent(sub);
                              const subMax = sub.max_score || MAX_SCORE;
                              const subScore = sub.total_score ?? 0;

                              // Small icons for bonus indicators
                              const hasOH = sub.is_graded && sub.attended_office_hours !== null && sub.attended_office_hours !== undefined;
                              const hasPres = sub.is_graded && sub.presented !== null && sub.presented !== undefined;

                              return (
                                <div
                                  key={sub.id}
                                  onClick={() => navigate(`/coach/grading/${sub.id}`)}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 120px 110px 120px",
                                    alignItems: "center",
                                    padding: "16px 20px",
                                    borderBottom: "1px solid #f5f5f5",
                                    cursor: "pointer",
                                    gap: 16,
                                    transition: "background 0.15s",
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                  <div>
                                    <div style={{
                                      fontFamily: "Montserrat, sans-serif",
                                      fontWeight: 600,
                                      fontSize: 14,
                                      color: "#000",
                                    }}>
                                      {sub.first_name} {sub.last_name?.charAt(0)}.
                                    </div>
                                    {sub.is_graded && (hasOH || hasPres) && (
                                      <div style={{
                                        fontFamily: "Montserrat, sans-serif",
                                        fontSize: 11,
                                        color: "#888",
                                        marginTop: 4,
                                        display: "flex",
                                        gap: 10,
                                      }}>
                                        {hasOH && (
                                          <span title="Office Hours">
                                            OH:{" "}
                                            <strong style={{
                                              color: sub.attended_office_hours ? "#5a8a1a" : "#C0392B",
                                            }}>
                                              {sub.attended_office_hours ? "+2" : "−2"}
                                            </strong>
                                          </span>
                                        )}
                                        {hasPres && (
                                          <span title="Presentation">
                                            Pres:{" "}
                                            <strong style={{
                                              color: sub.presented ? "#5a8a1a" : "#888",
                                            }}>
                                              {sub.presented ? "+5" : "0"}
                                            </strong>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ textAlign: "center" }}>
                                    <StatusBadge type="submitted" text="SUBMITTED" />
                                  </div>

                                  <div style={{
                                    fontFamily: "Montserrat, sans-serif",
                                    fontWeight: 700,
                                    fontSize: 14,
                                    color: sub.is_graded ? "#000" : "#999",
                                    textAlign: "center",
                                  }}>
                                    {sub.is_graded ? (
                                      <>
                                        <div>{scorePercent}%</div>
                                        <div style={{
                                          fontSize: 11,
                                          color: "#888",
                                          fontWeight: 500,
                                          marginTop: 2,
                                        }}>
                                          {subScore} / {subMax}
                                        </div>
                                      </>
                                    ) : "—"}
                                  </div>

                                  <div style={{ textAlign: "center" }}>
                                    <StatusBadge
                                      type={sub.is_graded ? "graded" : "ungraded"}
                                      text={sub.is_graded ? "GRADED" : "UNGRADED"}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      };

                      return (
                        <>
                          {renderStudentSection("premium", "PREMIUM", premium)}
                          {renderStudentSection("standard", "STANDARD", standard)}
                        </>
                      );
                    })()}
                  </>
                )}

                {/* Chevron toggle */}
                <div style={{ textAlign: "center", marginTop: 4 }}>
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
                  >
                    <ChevronDown />
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </CoachLayout>
  );
}