import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { CURRICULUM } from "../../data/curriculum";
import CoachLayout from "./CoachLayout";

// ── Icons ────────
const StudentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4FC2F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const StudentRowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Progress Ring ──
function ProgressRing({ percent, size = 120, strokeWidth = 10, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = "#8DC540";

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
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: "#000",
          lineHeight: 1,
        }}>
          {percent}%
        </div>
        {label && (
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            fontSize: 9,
            letterSpacing: 0.8,
            color: "#666",
            marginTop: 4,
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Status pill ──
const TrackPill = ({ onTrack }) => (
  <span style={{
    padding: "6px 14px",
    borderRadius: 4,
    background: onTrack ? "#8DC540" : "#C0392B",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: "Montserrat, sans-serif",
    whiteSpace: "nowrap",
  }}>
    {onTrack ? "ON TRACK" : "OFF TRACK"}
  </span>
);

const GradingPill = ({ status }) => {
  const styles = {
    complete: { bg: "#8DC540", text: "GRADING COMPLETE" },
    "in-progress": { bg: "#196AB4", text: "GRADING IN PROGRESS" },
    pending: { bg: "#D5D5D5", text: "NOT YET SUBMITTED", color: "#666" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{
      padding: "10px 22px",
      borderRadius: 6,
      background: s.bg,
      color: s.color || "#fff",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      fontFamily: "Montserrat, sans-serif",
      whiteSpace: "nowrap",
    }}>
      {s.text}
    </span>
  );
};

// ── Avatar with profile picture support ──
function StudentAvatar({ student }) {
  const avatarUrl = student?.profile_picture
    ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/users/profile-picture/${student.profile_picture}`
    : null;

  if (avatarUrl) {
    return (
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "#f0f0f0",
      }}>
        <img
          src={avatarUrl}
          alt={student.first_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <StudentRowIcon />
    </div>
  );
}

// ── One student row ──
function StudentRow({ student, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 18px",
        border: "1px solid #EDEDED",
        borderRadius: 12,
        marginBottom: 10,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FAFAFA";
        e.currentTarget.style.borderColor = "#DDD";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
        e.currentTarget.style.borderColor = "#EDEDED";
      }}
    >
      <StudentAvatar student={student} />
      <div style={{
        flex: 1,
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: "#000",
      }}>
        {student.first_name} {student.last_name}
      </div>
      <TrackPill onTrack={student.on_track} />
      <div style={{
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        color: "#000",
        minWidth: 40,
        textAlign: "right",
      }}>
        {student.progress_percent || 0}%
      </div>
    </div>
  );
}

export default function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState({ premium: [], standard: [] });
  const [grading, setGrading] = useState({ submissions: [], by_week: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/coach/students"),
      api.get("/coach/grading"),
    ])
      .then(([studentsRes, gradingRes]) => {
        setStudents(studentsRes.data);
        setGrading(gradingRes.data);
      })
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // ── Determine current week ──
  // Use the most common current_week from students (since coach has multiple students)
  const allStudents = [...(students.premium || []), ...(students.standard || [])];
  const currentWeek = allStudents[0]?.current_week || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  // ── Top bar progress: average across all students for current week ──
  const studentAvg = allStudents.length > 0
    ? Math.round(allStudents.reduce((sum, s) => sum + (s.progress_percent || 0), 0) / allStudents.length)
    : 0;

  // ── Current week's assignment grading status ──
  const currentWeekSubs = grading.by_week?.[currentWeek] || [];
  const assignmentLesson = currentWeekData?.lessons?.find(l => l.type === "upload");
  const assignmentTitle = assignmentLesson?.title || "Work Assignment";

  let gradingStatus = "pending";
  if (currentWeekSubs.length > 0) {
    const allGraded = currentWeekSubs.every(s => s.is_graded);
    gradingStatus = allGraded ? "complete" : "in-progress";
  }

  // First name greeting
  const greeting = user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome back, Coach!";

  return (
    <CoachLayout>
    {/* ── TOP PROGRESS BAR ── */}
<div className="coach-topbar">
  <div className="coach-topbar-label">
    <span>WEEK {currentWeek}</span>
    <span className="coach-topbar-dot">•</span>
    <span>{currentWeekData?.title?.toUpperCase() || ""} PHASE</span>
  </div>
  <div className="coach-topbar-progress">
    <div className="coach-topbar-bar">
      <div className="coach-topbar-fill" style={{ width: `${studentAvg}%` }} />
    </div>
    <span className="coach-topbar-percent">{studentAvg}%</span>
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
          {/* ── DARK WELCOME HERO ── */}
          <div style={{
              background: "#350020",
              borderRadius: 16,
              padding: "32px 36px",
              marginBottom: 16,
              color: "#fff",
              textAlign: "center",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            }}>
            <h1 style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 30,
              margin: "0 0 10px 0",
              color: "#fff",
            }}>
              {greeting} 👋
            </h1>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 14,
              color: "rgba(255, 255, 255, 0.85)",
              margin: 0,
              lineHeight: 1.5,
            }}>
              Supporting the next generation's innovation. Lorem ipsum dolor sit amet.
            </p>
          </div>

          {/* ── CURRENT PHASE CARD ── */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              marginBottom: 24,
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 2,
                  marginBottom: 6,
                }}>
                  <span style={{ color: "#000" }}>CURRENT PHASE: </span>
                  <span style={{ color: "#196AB4" }}>{currentWeekData?.title?.toUpperCase() || ""}</span>
                </div>
                <h2 style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: 26,
                  fontWeight: 600,
                  margin: 0,
                  color: "#000",
                }}>
                  Week {currentWeek}
                </h2>
              </div>
              <ProgressRing percent={studentAvg} size={110} strokeWidth={9} label="STUDENT AVG." />
            </div>

            {/* Work Assignment row */}
            <div
              onClick={() => navigate("/coach/grading")}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 22px",
                border: "1px solid #EDEDED",
                borderRadius: 12,
                cursor: "pointer",
                transition: "background 0.15s",
                gap: 16,
                flexWrap: "wrap",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: "#000",
              }}>
                {assignmentTitle}
              </div>
              <GradingPill status={gradingStatus} />
            </div>
          </div>

          {/* ── MY STUDENTS CARD ── */}
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: "28px 32px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StudentIcon />
                <h2 style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 600,
                  fontSize: 22,
                  color: "#000",
                  margin: 0,
                }}>
                  My Students
                </h2>
              </div>
              <button
                onClick={() => navigate("/coach/students")}
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
                <EyeIcon />
                View All
              </button>
            </div>
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              color: "#888",
              margin: "0 0 20px 0",
            }}>
              Your assigned students grouped by tier with current standing.
            </p>

            {/* PREMIUM TIER */}
            {students.premium?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 2,
                  color: "#648C2D",
                  marginBottom: 12,
                }}>
                  PREMIUM TIER
                </div>
                {students.premium.map(s => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onClick={() => navigate(`/coach/students/${s.id}`)}
                  />
                ))}
              </div>
            )}

            {/* STANDARD TIER */}
            {students.standard?.length > 0 && (
              <div>
                <div style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 2,
                  color: "#196AB4",
                  marginBottom: 12,
                }}>
                  STANDARD TIER
                </div>
                {students.standard.map(s => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onClick={() => navigate(`/coach/students/${s.id}`)}
                  />
                ))}
              </div>
            )}

            {students.premium?.length === 0 && students.standard?.length === 0 && (
              <div style={{
                padding: 40,
                textAlign: "center",
                color: "#888",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
                No students assigned yet.
              </div>
            )}
          </div>
        </>
      )}
    </CoachLayout>
  );
}