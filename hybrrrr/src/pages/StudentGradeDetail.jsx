import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/grade-detail.css";
import alphaLogo from "../assets/images/alpha-loggo.png";

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
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
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
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 20,
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
      padding: "5px 12px", borderRadius: 4,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
      display: "inline-block", minWidth: 90, textAlign: "center",
    }}>
      {text}
    </span>
  );
};

const YesNoTag = ({ value }) => {
  if (value === true) {
    return (
      <span style={{
        padding: "5px 12px", borderRadius: 4, background: "#8DC540", color: "#fff",
        fontSize: 10, fontWeight: 700, letterSpacing: 1.2, fontFamily: "Montserrat, sans-serif",
      }}>YES</span>
    );
  }
  if (value === false) {
    return (
      <span style={{
        padding: "5px 12px", borderRadius: 4, background: "#C0392B", color: "#fff",
        fontSize: 10, fontWeight: 700, letterSpacing: 1.2, fontFamily: "Montserrat, sans-serif",
      }}>NO</span>
    );
  }
  return (
    <span style={{
      padding: "5px 12px", borderRadius: 4, background: "#EDEDED", color: "#666",
      fontSize: 10, fontWeight: 700, letterSpacing: 1.2, fontFamily: "Montserrat, sans-serif",
    }}>PENDING</span>
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

  const isGraded = submission?.is_graded;
  const percent = isGraded ? submission.percent : 0;

  const criteriaTotal = submission?.criteria_total ?? 0;
  const officeHoursPoints = submission?.office_hours_points ?? 0;
  const presentationPoints = submission?.presentation_points ?? 0;
  const totalScore = submission?.total_score ?? 0;
  const maxScore = submission?.max_score ?? 32;

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

        {/* BACK BUTTON */}
        <button onClick={() => navigate("/my-grades")} className="grade-back-btn">
          <ArrowLeft /> Back to My Grades
        </button>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: 80, textAlign: "center", color: "#cc0000" }}>{error}</div>
        ) : (
          <>
            {/* ── My Average / My Grade Card ── */}
            <div className="grade-tier-card">
              <div className="grade-tier-text">
                <div className="grade-tier-label" style={{ color: tierColor }}>
                  {tier.toUpperCase()} TIER
                </div>
                <h1 className="grade-tier-title">
                  {submission ? "My Average" : "My Grade"}
                </h1>
              </div>
              <ProgressRing percent={submission ? overallAvg : 0} size={90} strokeWidth={8} />
            </div>

            {/* ── ASSIGNMENT ROW + ACTION BUTTON ── */}
            <div className="grade-assignment-card">
              <div className="grade-assignment-row">
                <div className="grade-assignment-title">
                  {lessonInfo?.title || "Work Assignment"}
                </div>
                <div className="grade-assignment-status">
                  <StatusPill
                    type={submission ? "submitted" : "not-started"}
                    text={submission ? "SUBMITTED" : "NOT STARTED"}
                  />
                </div>
                <div className="grade-assignment-percent" style={{
                  color: isGraded ? (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#999") : "#999",
                }}>
                  {isGraded ? `${percent}%` : "0%"}
                </div>
                <div className="grade-assignment-grade">
                  <StatusPill
                    type={isGraded ? "graded" : "ungraded"}
                    text={isGraded ? "GRADED" : "UNGRADED"}
                  />
                </div>
              </div>

              {/* Conditional button: Upload (clickable) vs Submitted (disabled) */}
              {submission ? (
                <button disabled className="grade-submitted-btn">
                  Assignment Submitted
                </button>
              ) : (
                <>
                  <button
                    className="grade-upload-btn"
                    onClick={() => navigate(`/lesson/${week}/${lessonId}`)}
                  >
                    <UploadIcon /> Upload Your Assignment
                  </button>
                  <div className="grade-upload-caption">
                    *PDF Submissions Only
                  </div>
                </>
              )}
            </div>

            {/* ── ASSIGNMENT TITLE + DESCRIPTION + RUBRIC ── */}
            <div className="grade-rubric-card">
              <h2 className="grade-rubric-title">
                {lessonInfo?.title || "Assignment Title, Lorem Ipsum Dolor"}
              </h2>
              <p className="grade-rubric-desc">
                About the assignment. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Vestibulum aliquam tellus sit amet eros maximus gravida. Vestibulum sit amet nisl libero.
              </p>

              <h3 className="grade-rubric-subtitle">Grading Rubric/Criteria</h3>

              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="grade-criterion-item">
                  <div className="grade-criterion-label">CRITERION {n}</div>
                  <div className="grade-criterion-text">
                    Criteria Details. Aliquam dignissim, dui vel auctor congue, ipsum sem interdum magna.
                  </div>
                </div>
              ))}
            </div>

            {/* ── GRADING SECTION ── */}
            <div className="grade-grading-card">
              <h3 className="grade-grading-title">Grading</h3>

              {/* 5 criterion cards (empty boxes if not graded) */}
              <div className="grade-criterion-grid">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="grade-criterion-card">
                    <div className="grade-criterion-card-label">CRITERION {n}</div>
                    {isGraded && (
                      <div className="grade-criterion-card-value">
                        {submission[`criterion_${n}`] ?? "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* ── PARTICIPATION & PRESENTATION (only if submitted) ── */}
              {submission && (
                <div className="grade-participation-section">
                  <h4 className="grade-participation-title">
                    Participation & Presentation
                  </h4>

                  {/* Office Hours row */}
                  <div className="grade-participation-row">
                    <div className="grade-participation-text">
                      <div className="grade-participation-name">Attended Office Hours</div>
                      <div className="grade-participation-hint">
                        Yes = +2 pts &nbsp;•&nbsp; No = −2 pts
                      </div>
                    </div>
                    <div className="grade-participation-right">
                      {isGraded && (
                        <span className="grade-participation-points" style={{
                          color: officeHoursPoints > 0 ? "#5a8a1a" : officeHoursPoints < 0 ? "#C0392B" : "#888",
                        }}>
                          {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
                        </span>
                      )}
                      <YesNoTag value={isGraded ? submission.attended_office_hours : null} />
                    </div>
                  </div>

                  {/* Presentation row */}
                  <div className="grade-participation-row">
                    <div className="grade-participation-text">
                      <div className="grade-participation-name">Presented</div>
                      <div className="grade-participation-hint">
                        Yes = +5 pts &nbsp;•&nbsp; No = 0 pts
                      </div>
                    </div>
                    <div className="grade-participation-right">
                      {isGraded && (
                        <span className="grade-participation-points" style={{
                          color: presentationPoints > 0 ? "#5a8a1a" : "#888",
                        }}>
                          {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
                        </span>
                      )}
                      <YesNoTag value={isGraded ? submission.presented : null} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── SCORE BREAKDOWN (only if graded) ── */}
              {isGraded && (
                <div className="grade-breakdown">
                  <div className="grade-breakdown-row">
                    <span>Criteria (1–5)</span>
                    <span style={{ fontWeight: 600 }}>{criteriaTotal} / 25</span>
                  </div>
                  <div className="grade-breakdown-row">
                    <span>Office Hours</span>
                    <span style={{ fontWeight: 600, color: officeHoursPoints < 0 ? "#C0392B" : "#000" }}>
                      {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
                    </span>
                  </div>
                  <div className="grade-breakdown-row">
                    <span>Presentation</span>
                    <span style={{ fontWeight: 600 }}>
                      {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
                    </span>
                  </div>
                  <div className="grade-breakdown-total">
                    <span>Final Score</span>
                    <span>{totalScore} / {maxScore}</span>
                  </div>
                </div>
              )}

              {/* Coach Feedback — always show */}
              <div className="grade-feedback">
                <div className="grade-feedback-label">
                  COACH FEEDBACK
                  {isGraded && submission?.coach_first_name && (
                    <span style={{ opacity: 0.6, fontWeight: 500, fontSize: 11 }}>
                      — {submission.coach_first_name} {submission.coach_last_name?.charAt(0)}.
                    </span>
                  )}
                </div>
                <div className="grade-feedback-text" style={{
                  color: isGraded ? "#333" : "#999",
                  fontStyle: isGraded ? "normal" : "italic",
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

                {isGraded && submission?.graded_at && (
                  <div className="grade-feedback-date">
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