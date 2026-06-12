import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CURRICULUM } from "../../data/curriculum";
import AdminLayout from "./AdminLayout";

// ── Icons ────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Lesson type icon mapping
const LESSON_ICONS = {
  module:   "📘",
  image:    "🖼️",
  video:    "🎥",
  audio:    "🎧",
  download: "📥",
  upload:   "📤",
  quiz:     "📝",
  info:     "💡",
  feedback: "💬",
};

const TYPE_COLORS = {
  module:   "#196AB4",
  image:    "#9C27B0",
  video:    "#E74C3C",
  audio:    "#FF9800",
  download: "#00ACC1",
  upload:   "#4CAF50",
  quiz:     "#FF5722",
  info:     "#607D8B",
  feedback: "#795548",
};

export default function AdminContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState({ by_week: {} });
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true }); // Week 1 expanded by default
  const [error, setError] = useState("");

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/content");
      setContent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  // Check if a lesson has content in DB
  const hasContent = (weekNum, lessonId) => {
    const weekContent = content.by_week[weekNum] || [];
    return weekContent.some(c => c.lesson_id === lessonId);
  };

  // Count how many lessons in a week have content
  const getWeekStats = (weekNum) => {
    const week = CURRICULUM[weekNum];
    const dbContent = content.by_week[weekNum] || [];
    const totalLessons = week?.lessons?.length || 0;
    const filled = dbContent.length;
    return { filled, total: totalLessons };
  };

  // Navigate to editor
  const handleEdit = (weekNumber, lessonId) => {
    navigate(`/admin/content/${weekNumber}/${lessonId}`);
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Content Manager</h1>
          <p className="admin-subtitle">
            Manage videos, audio, text, and quiz content for all 8 weeks
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── STATS CARDS ── */}
      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-label">Total Lessons</div>
          <div className="stat-value">
            {Object.values(CURRICULUM).reduce((sum, w) => sum + w.lessons.length, 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Content Created</div>
          <div className="stat-value green">{content.content?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Needs Content</div>
          <div className="stat-value orange">
            {Object.values(CURRICULUM).reduce((sum, w) => sum + w.lessons.length, 0) - (content.content?.length || 0)}
          </div>
        </div>
      </div>

      {/* ── WEEKS LIST ── */}
      {loading ? (
        <div className="coach-loading" style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center" }}>
          Loading content...
        </div>
      ) : (
        <>
          {Object.values(CURRICULUM).map((week) => {
            const isExpanded = expandedWeeks[week.weekNumber];
            const stats = getWeekStats(week.weekNumber);
            const percent = stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0;

            return (
              <div
                key={week.weekNumber}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  marginBottom: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Week Header (clickable) */}
                <div
                  onClick={() => toggleWeek(week.weekNumber)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 24,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#196AB4",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Raleway, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}>
                      {week.weekNumber}
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: 20,
                        fontWeight: 600,
                        margin: 0,
                        color: "#000",
                      }}>
                        Week {week.weekNumber}: {week.title}
                      </h3>
                      <p style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        color: "#666",
                        margin: "4px 0 0 0",
                      }}>
                        {week.subtitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    {/* Progress badge */}
                    <div style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      background: percent === 100 ? "#E8F5DC" : percent > 0 ? "#FFF4E0" : "#F5F5F5",
                      color: percent === 100 ? "#648C2D" : percent > 0 ? "#C68B00" : "#888",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                    }}>
                      {stats.filled} / {stats.total} LESSONS
                    </div>

                    {/* Chevron */}
                    <div style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}>
                      <ChevronDown />
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f0f0f0", padding: "0 24px 24px" }}>
                    {week.lessons.map((lesson, idx) => {
                      const filled = hasContent(week.weekNumber, lesson.id);
                      const typeColor = TYPE_COLORS[lesson.type] || "#666";

                      return (
                        <div
                          key={lesson.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            marginTop: idx === 0 ? 16 : 0,
                            border: "1px solid #EDEDED",
                            borderRadius: 12,
                            marginBottom: 8,
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                            {/* Type icon */}
                            <div style={{
                              fontSize: 20,
                              width: 36,
                              height: 36,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: `${typeColor}15`,
                              borderRadius: 8,
                              flexShrink: 0,
                            }}>
                              {LESSON_ICONS[lesson.type] || "📄"}
                            </div>

                            {/* Lesson info */}
                            <div>
                              <div style={{
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#000",
                              }}>
                                {lesson.title}
                              </div>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginTop: 4,
                              }}>
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: `${typeColor}15`,
                                  color: typeColor,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  letterSpacing: 0.8,
                                  textTransform: "uppercase",
                                  fontFamily: "Montserrat, sans-serif",
                                }}>
                                  {lesson.type}
                                </span>
                                <span style={{
                                  fontFamily: "Montserrat, sans-serif",
                                  fontSize: 11,
                                  color: "#888",
                                }}>
                                  • {lesson.duration}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status + Edit button */}
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {filled ? (
                              <span style={{
                                padding: "5px 12px",
                                borderRadius: 4,
                                background: "#8DC540",
                                color: "#fff",
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                fontFamily: "Montserrat, sans-serif",
                              }}>
                                ✓ READY
                              </span>
                            ) : (
                              <span style={{
                                padding: "5px 12px",
                                borderRadius: 4,
                                background: "#FFE0E0",
                                color: "#C0392B",
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: 1,
                                textTransform: "uppercase",
                                fontFamily: "Montserrat, sans-serif",
                              }}>
                                EMPTY
                              </span>
                            )}

                            <button
                              onClick={() => handleEdit(week.weekNumber, lesson.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 16px",
                                background: filled ? "#196AB4" : "#000",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                                fontFamily: "Montserrat, sans-serif",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              <EditIcon />
                              {filled ? "Edit" : "Add Content"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </AdminLayout>
  );
}