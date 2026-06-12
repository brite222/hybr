import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CURRICULUM } from "../../data/curriculum";
import CoachLayout from "./CoachLayout";

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UserIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ── Clean Progress Ring (Montserrat for %) ──
function ProgressRing({ percent, size = 80, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  
  const color = percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#E74C3C";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E5E5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Montserrat, sans-serif",   // ✅ MONTSERRAT
        fontWeight: 700,
        fontSize: size > 100 ? 24 : size > 70 ? 16 : 13,
        color: "#000",
      }}>
        {percent}%
      </div>
    </div>
  );
}

export default function CoachStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState({});

  useEffect(() => {
    api.get(`/coach/students/${id}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const getWeekProgress = (weekNum, completedIds) => {
    const week = CURRICULUM[weekNum];
    if (!week) return 0;
    const completed = week.lessons.filter(l => completedIds.includes(l.id)).length;
    return Math.round((completed / week.lessons.length) * 100);
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="coach-loading">Loading student details...</div>
      </CoachLayout>
    );
  }

  if (error || !data) {
    return (
      <CoachLayout>
        <div className="coach-empty">
          <div className="coach-empty-icon">⚠️</div>
          <div className="coach-empty-title">Error</div>
          <p>{error || "Student not found"}</p>
        </div>
      </CoachLayout>
    );
  }

  const { student, completed_lessons } = data;
  const completedIds = completed_lessons.map(l => l.lesson_id);
  const currentWeekNum = student.current_week || 1;

  return (
    <CoachLayout>
      {/* Back button */}
      <button
        onClick={() => navigate("/coach/students")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "#4FC2F0",
          cursor: "pointer",
          marginBottom: 24,
          fontSize: 14,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 500,
          padding: 0,
        }}
      >
        <ArrowLeft /> Back to Students
      </button>

      {/* ── STUDENT PROFILE CARD ── */}
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 32,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {/* ── LEFT: Avatar + Tier + Name (stacked) ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
          flex: 1,
        }}>
          {/* Avatar */}
          <div style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "#f5f5f5",
            border: "3px solid #4FC2F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            {student.profile_picture ? (
              <img
                src={`http://localhost:5000/api/users/profile-picture/${student.profile_picture}`}
                alt={student.first_name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <UserIcon />
            )}
          </div>

          {/* ✅ TIER LABEL UNDER IMAGE */}
          <div style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 2,
            color: student.tier === "premium" ? "#648C2D" : "#196AB4",  
            marginTop: 4,
          }}>
            {student.tier?.toUpperCase()} TIER
          </div>

          {/* Name */}
          <h1 style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            margin: 0,
            color: "#000",
            lineHeight: 1.1,
          }}>
            {student.first_name} {student.last_name}
          </h1>

          {/* Email + Cohort (small, subtle) */}
          {student.email && (
            <div style={{
              fontFamily: "Montserrat, sans-serif",
              color: "#888",
              fontSize: 13,
              marginTop: 2,
            }}>
              {student.email}
              {student.cohort_name && ` • ${student.cohort_name}`}
            </div>
          )}
        </div>

        {/* ── RIGHT: Big Progress Ring ── */}
        <ProgressRing percent={student.progress_percent || 0} size={120} strokeWidth={10} />
      </div>

      {/* ── WEEKS LIST ── */}
      {Object.values(CURRICULUM).map((week) => {
        const isCurrent = week.weekNumber === currentWeekNum;
        const weekProgress = getWeekProgress(week.weekNumber, completedIds);
        const isExpanded = expandedWeeks[week.weekNumber];

        return (
          <div
            key={week.weekNumber}
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 16,
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            {/* Week Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => toggleWeek(week.weekNumber)}
            >
              <div>
                <div style={{
                  fontFamily: "Raleway, sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: 2,
                  color: isCurrent ? "#648C2D" : "#196AB4",  
                  marginBottom: 4,
                }}>
                  {isCurrent ? "CURRENT WEEK: " : ""}{week.title.toUpperCase()}
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
              <ProgressRing percent={weekProgress} size={70} strokeWidth={7} />
            </div>

            {/* Expandable Lessons */}
            {isExpanded && (
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #f0f0f0",
              }}>
                {week.lessons.map((lesson) => {
                  const isComplete = completedIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 0",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 500,
                        fontSize: 15,
                        color: "#000",
                      }}>
                        {lesson.title}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{
                          padding: "6px 14px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          fontFamily: "Montserrat, sans-serif",
                          background: isComplete ? "#8DC540" : "#E5E5E5",
                          color: isComplete ? "#fff" : "#888",
                        }}>
                          {isComplete ? "COMPLETE" : "NOT STARTED"}
                        </span>
                        <span style={{
                          fontFamily: "Montserrat, sans-serif",   // ✅ MONTSERRAT
                          fontWeight: 600,
                          fontSize: 14,
                          minWidth: 40,
                          textAlign: "right",
                          color: "#000",
                        }}>
                          {isComplete ? "100%" : "0%"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Chevron toggle */}
            <div style={{
              textAlign: "center",
              marginTop: 12,
              borderTop: !isExpanded ? "1px solid #f5f5f5" : "none",
              paddingTop: !isExpanded ? 12 : 0,
            }}>
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
    </CoachLayout>
  );
}