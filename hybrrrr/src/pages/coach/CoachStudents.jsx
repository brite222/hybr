import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CURRICULUM } from "../../data/curriculum";
import CoachLayout from "./CoachLayout";

const StudentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const PencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M22 8l-6 4 6 4V8z" />
  </svg>
);

const SlidesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export default function CoachStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState({ premium: [], standard: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/coach/students")
      .then(res => setStudents(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleStudentClick = (id) => {
    navigate(`/coach/students/${id}`);
  };

  // Calculate current week (use first student's data, or default to 1)
  const allStudents = [...(students.premium || []), ...(students.standard || [])];
  const currentWeek = allStudents[0]?.current_week || 1;
  const weekData = CURRICULUM[currentWeek];

  // Calculate average progress across all students
  const avgProgress = allStudents.length > 0
    ? Math.round(allStudents.reduce((sum, s) => sum + s.progress_percent, 0) / allStudents.length)
    : 0;

  // Count lesson types for "Week X Content" card
  const lessonCounts = weekData ? weekData.lessons.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + 1;
    return acc;
  }, {}) : {};

  const renderSection = (tier, title, studentList) => {
    if (studentList.length === 0) return null;

    return (
      <div className="tier-section">
        <div className={`tier-label ${tier}`}>{tier.toUpperCase()}</div>
        <h2 className="tier-title">{title}</h2>
        
        <div className="students-card">
          {studentList.map((s) => (
            <div
              key={s.id}
              className="student-row"
              onClick={() => handleStudentClick(s.id)}
            >
              <div className="student-icon">
                <StudentIcon />
              </div>
              <div className="student-name">
                {s.first_name} {s.last_name}
              </div>
              <div className={`student-status-badge ${s.on_track ? "on-track" : "off-track"}`}>
                {s.on_track ? "ON TRACK" : "OFF TRACK"}
              </div>
              <div className="student-progress">
                {s.progress_percent}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <CoachLayout>
      {/* ── TOP PROGRESS BAR ── */}
      <div className="coach-topbar">
        <div className="coach-topbar-label">
          <span className="coach-topbar-week">WEEK {currentWeek}</span>
          <span className="coach-topbar-dot">•</span>
          <span className="coach-topbar-phase">
            {weekData?.title || "Week"} PHASE
          </span>
        </div>
        <div className="coach-topbar-progress">
          <div className="coach-topbar-bar">
            <div className="coach-topbar-fill" style={{ width: `${avgProgress}%` }} />
          </div>
          <span className="coach-topbar-percent">{avgProgress}%</span>
        </div>
      </div>

      {/* Header */}
      <div className="coach-header">
        <div>
          <h1 className="coach-greeting">My Students</h1>
          <p className="coach-subgreeting">
            {students.total} student{students.total !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div className="coach-content">
        {/* LEFT — Students list */}
        <div className="coach-left">
          {loading ? (
            <div className="coach-loading">Loading students...</div>
          ) : error ? (
            <div className="coach-empty">
              <div className="coach-empty-icon">⚠️</div>
              <div className="coach-empty-title">Error</div>
              <p>{error}</p>
            </div>
          ) : students.total === 0 ? (
            <div className="coach-empty">
              <div className="coach-empty-icon">👥</div>
              <div className="coach-empty-title">No students assigned</div>
              <p>Contact your admin to get students assigned to you.</p>
            </div>
          ) : (
            <>
              {renderSection("premium", "My Students", students.premium)}
              {renderSection("standard", "My Students", students.standard)}
            </>
          )}
        </div>

        {/* RIGHT — Week info + Content */}
        <aside className="coach-right">
          <div className="coach-info-card">
            <h3 className="coach-info-card-title">Week {currentWeek}</h3>
            <p className="coach-info-card-text">
              About Week {currentWeek}. {weekData?.subtitle || "Lorem ipsum dolor sit amet."}
            </p>
          </div>

          <div className="coach-info-card">
            <h3 className="coach-info-card-title">Week {currentWeek} Content</h3>
            <div className="coach-content-list">
              {lessonCounts.quiz > 0 && (
                <div className="coach-content-item">
                  <PencilIcon />
                  <span>{lessonCounts.quiz} Quiz{lessonCounts.quiz > 1 ? "zes" : ""}</span>
                </div>
              )}
              {lessonCounts.video > 0 && (
                <div className="coach-content-item">
                  <VideoIcon />
                  <span>{lessonCounts.video} Video{lessonCounts.video > 1 ? "s" : ""}</span>
                </div>
              )}
              {lessonCounts.audio > 0 && (
                <div className="coach-content-item">
                  <SlidesIcon />
                  <span>{lessonCounts.audio} Audio{lessonCounts.audio > 1 ? "s" : ""}</span>
                </div>
              )}
              {lessonCounts.download > 0 && (
                <div className="coach-content-item">
                  <SlidesIcon />
                  <span>{lessonCounts.download} Download{lessonCounts.download > 1 ? "s" : ""}</span>
                </div>
              )}
              {lessonCounts.upload > 0 && (
                <div className="coach-content-item">
                  <SlidesIcon />
                  <span>{lessonCounts.upload} Upload{lessonCounts.upload > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </CoachLayout>
  );
}