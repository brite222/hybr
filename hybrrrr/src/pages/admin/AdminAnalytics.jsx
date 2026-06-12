import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

// ── Stat Card ──
const StatCard = ({ icon, label, value, color = "#000", subtitle }) => (
  <div style={{
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#888",
        letterSpacing: 1,
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
    <div style={{
      fontFamily: "Montserrat, sans-serif",
      fontSize: 36,
      fontWeight: 800,
      color,
      lineHeight: 1,
    }}>
      {value ?? 0}
    </div>
    {subtitle && (
      <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
        {subtitle}
      </div>
    )}
  </div>
);

// ── Section Card ──
const SectionCard = ({ title, children, action }) => (
  <div style={{
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    marginBottom: 16,
  }}>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}>
      <h3 style={{
        fontFamily: "Raleway, sans-serif",
        fontSize: 18,
        fontWeight: 600,
        margin: 0,
        color: "#000",
      }}>
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

// ── Bar Chart (simple horizontal) ──
const BarChart = ({ data, labelKey, valueKey, color = "#8DC540", maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d[valueKey] || 0), 1);
  
  return (
    <div>
      {data.map((item, i) => {
        const value = parseInt(item[valueKey]) || 0;
        const widthPercent = (value / max) * 100;
        
        return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 4,
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 600 }}>{item[labelKey]}</span>
              <span style={{ color: "#666", fontWeight: 700 }}>{value}</span>
            </div>
            <div style={{
              background: "#f0f0f0",
              borderRadius: 4,
              height: 8,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${widthPercent}%`,
                height: "100%",
                background: color,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ── Format relative time ──
const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/analytics")
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: 60, textAlign: "center", color: "#888" }}>
          Loading analytics...
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="alert alert-error">{error}</div>
      </AdminLayout>
    );
  }

  const o = data.overview;

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">📊 Analytics Dashboard</h1>
          <p className="admin-subtitle">
            Program-wide insights and performance metrics
          </p>
        </div>
      </div>

      {/* ── OVERVIEW STATS GRID ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}>
        <StatCard icon="👥" label="Total Students" value={o.total_students} color="#196AB4" 
          subtitle={`${o.premium_students} premium • ${o.standard_students} standard`} />
        <StatCard icon="👨‍🏫" label="Coaches" value={o.total_coaches} color="#8DC540" />
        <StatCard icon="📚" label="Lessons Completed" value={o.total_lessons_completed} color="#9B59B6" />
        <StatCard icon="📤" label="Submissions" value={o.total_submissions} 
          subtitle={`${o.graded_count} graded • ${o.ungraded_count} pending`} />
        <StatCard icon="🏆" label="Total Points" value={o.total_points_earned} color="#F39C12" />
        <StatCard icon="🎖️" label="Badges Awarded" value={o.total_badges_awarded} color="#E74C3C" />
        <StatCard icon="📝" label="Quiz Attempts" value={o.total_quiz_attempts} color="#3498DB" />
        <StatCard icon="🗓️" label="Active Cohorts" value={o.active_cohorts} color="#1ABC9C" />
      </div>

      {/* ── GRADE STATS ── */}
      {data.gradeStats?.total_graded > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
          <StatCard icon="⭐" label="Average Grade" 
            value={`${parseFloat(data.gradeStats.avg_grade_percent || 0).toFixed(1)}%`} 
            color="#8DC540" />
          <StatCard icon="🔝" label="Highest Grade" 
            value={`${parseFloat(data.gradeStats.highest_grade || 0).toFixed(0)}%`} 
            color="#27AE60" />
          <StatCard icon="📉" label="Lowest Grade" 
            value={`${parseFloat(data.gradeStats.lowest_grade || 0).toFixed(0)}%`} 
            color="#E74C3C" />
        </div>
      )}

      {/* ── 2-COLUMN LAYOUT ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 16,
      }}>
        <div>
          {/* TOP STUDENTS */}
          <SectionCard title="🏆 Top 10 Students">
            {data.topStudents.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No students with points yet
              </div>
            ) : (
              <div>
                {data.topStudents.map((s, idx) => {
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "50px 1fr 80px 80px 80px",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontSize: idx < 3 ? 22 : 14, fontWeight: 700, textAlign: "center", color: "#666" }}>
                        {medal}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</div>
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 1,
                          color: s.tier === "premium" ? "#648C2D" : "#196AB4",
                          marginTop: 2,
                        }}>
                          {(s.tier || "STANDARD").toUpperCase()}
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 700 }}>{s.lessons_done}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>LESSONS</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontWeight: 700 }}>{s.badges} 🎖️</div>
                        <div style={{ fontSize: 10, color: "#888" }}>BADGES</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "#8DC540" }}>
                          {s.total_points || 0}
                        </div>
                        <div style={{ fontSize: 10, color: "#888" }}>POINTS</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* WEEKLY ENGAGEMENT */}
          <SectionCard title="📈 Lessons Completed Per Week">
            {data.weeklyEngagement.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No activity yet
              </div>
            ) : (
              <BarChart
                data={data.weeklyEngagement.map(w => ({
                  ...w,
                  label: `Week ${w.week_number}`,
                }))}
                labelKey="label"
                valueKey="total_completions"
                color="#196AB4"
              />
            )}
          </SectionCard>

          {/* COMPLETION RATES */}
          <SectionCard title="🎯 Student Engagement by Week (% of students)">
            {data.completionRates.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No data yet
              </div>
            ) : (
              <BarChart
                data={data.completionRates.map(w => ({
                  ...w,
                  label: `Week ${w.week_number}`,
                }))}
                labelKey="label"
                valueKey="completion_percent"
                color="#8DC540"
                maxValue={100}
              />
            )}
          </SectionCard>
        </div>

        <div>
          {/* RECENT ACTIVITY */}
          <SectionCard title="⚡ Recent Activity">
            {data.recentActivity.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No activity yet
              </div>
            ) : (
              <div>
                {data.recentActivity.map((act, i) => {
                  const icon = {
                    signup: "👋",
                    submission: "📤",
                    badge: "🎖️",
                  }[act.type] || "•";
                  
                  const color = {
                    signup: "#196AB4",
                    submission: "#F39C12",
                    badge: "#8DC540",
                  }[act.type] || "#888";

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 12,
                        padding: "10px 0",
                        borderBottom: i < data.recentActivity.length - 1 ? "1px solid #f5f5f5" : "none",
                      }}
                    >
                      <div style={{
                        fontSize: 20,
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, fontFamily: "Montserrat, sans-serif" }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>
                          {act.user_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                          {act.description}
                        </div>
                        <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
                          {timeAgo(act.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* TOP BADGES */}
          <SectionCard title="🎖️ Most-Earned Badges">
            {data.topBadges.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No badges earned yet
              </div>
            ) : (
              <div>
                {data.topBadges.map(b => (
                  <div key={b.code} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                    fontFamily: "Montserrat, sans-serif",
                  }}>
                    <div style={{ fontSize: 28 }}>{b.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                    </div>
                    <div style={{
                      padding: "4px 10px",
                      background: `${b.color}20`,
                      color: b.color,
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 100,
                    }}>
                      {b.earned_count} earned
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* COACH WORKLOAD */}
          <SectionCard title="👨‍🏫 Coach Workload">
            {data.coachWorkload.length === 0 ? (
              <div style={{ color: "#888", textAlign: "center", padding: 20 }}>
                No coaches yet
              </div>
            ) : (
              <div>
                {data.coachWorkload.map(c => (
                  <div key={c.id} style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #f5f5f5",
                    fontFamily: "Montserrat, sans-serif",
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {c.first_name} {c.last_name}
                    </div>
                    <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                      👥 {c.student_count} students • ⭐ {c.graded_count} graded
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </AdminLayout>
  );
}