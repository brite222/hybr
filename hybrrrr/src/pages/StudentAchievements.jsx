import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/dashboard.css";
import alphaLogo from "../assets/images/alpha-loggo.png";

// ── Icons ────────
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function StudentAchievements() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("badges");
  const [badges, setBadges] = useState({ earned: [], locked: [], earned_count: 0, total: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/badges/me").catch(() => ({ data: { earned: [], locked: [], earned_count: 0, total: 0 } })),
      api.get("/points/leaderboard").catch(() => ({ data: { leaderboard: [] } })),
    ]).then(([badgesRes, lbRes]) => {
      setBadges(badgesRes.data);
      setLeaderboard(lbRes.data.leaderboard || []);
    }).finally(() => setLoading(false));
  }, []);

  const myRank = leaderboard.findIndex(s => s.id === user?.id) + 1;

  return (
    <div className="module-page">
      {/* ── MOBILE HEADER (consistent with other pages) ── */}
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">
          <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
        </div>
        <button
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ── SHARED SIDEBAR ── */}
      <StudentSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* ── MAIN ── */}
      <main className="module-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-greeting">Achievements 🏆</h1>
            <p className="dashboard-subgreeting">
              Earn badges and climb the leaderboard
            </p>
          </div>
        </header>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div style={{
            background: "linear-gradient(135deg, #8DC540, #648C2D)",
            color: "#fff",
            padding: 24,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(141, 197, 64, 0.3)",
          }}>
            <div style={{ fontSize: 32, fontFamily: "Montserrat", fontWeight: 800 }}>
              {badges.earned_count}/{badges.total}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700, letterSpacing: 1.5, marginTop: 4 }}>
              🎖️ BADGES EARNED
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #196AB4, #0F4078)",
            color: "#fff",
            padding: 24,
            borderRadius: 12,
            textAlign: "center",
            boxShadow: "0 4px 16px rgba(25, 106, 180, 0.3)",
          }}>
            <div style={{ fontSize: 32, fontFamily: "Montserrat", fontWeight: 800 }}>
              {myRank > 0 ? `#${myRank}` : "—"}
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700, letterSpacing: 1.5, marginTop: 4 }}>
              🏆 YOUR RANK
            </div>
          </div>
        </div>

        {/* Tab Switch */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid #ddd" }}>
          <button
            onClick={() => setTab("badges")}
            style={{
              padding: "12px 24px",
              background: tab === "badges" ? "#fff" : "transparent",
              border: "none",
              borderBottom: tab === "badges" ? "3px solid #8DC540" : "3px solid transparent",
              cursor: "pointer",
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: tab === "badges" ? "#000" : "#666",
            }}
          >
            🎖️ Badges
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            style={{
              padding: "12px 24px",
              background: tab === "leaderboard" ? "#fff" : "transparent",
              border: "none",
              borderBottom: tab === "leaderboard" ? "3px solid #8DC540" : "3px solid transparent",
              cursor: "pointer",
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: tab === "leaderboard" ? "#000" : "#666",
            }}
          >
            🏆 Leaderboard
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loading">Loading...</div>
        ) : tab === "badges" ? (
          <>
            <h3 style={{ fontFamily: "Raleway", fontSize: 20, marginTop: 0, marginBottom: 16 }}>
              ✨ Earned ({badges.earned_count})
            </h3>
            {badges.earned.length === 0 ? (
              <div style={{ background: "#fff", padding: 40, borderRadius: 16, textAlign: "center", color: "#888" }}>
                Complete lessons to earn your first badge!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
                {badges.earned.map(badge => (
                  <div
                    key={badge.id}
                    style={{
                      background: "#fff",
                      padding: 20,
                      borderRadius: 16,
                      textAlign: "center",
                      border: `3px solid ${badge.color}`,
                      boxShadow: `0 4px 16px ${badge.color}40`,
                    }}
                  >
                    <div style={{ fontSize: 56, marginBottom: 8 }}>{badge.icon}</div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 16, color: "#000", marginBottom: 4 }}>
                      {badge.name}
                    </div>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                      {badge.description}
                    </div>
                    <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 10, color: "#999", marginTop: 8 }}>
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ fontFamily: "Raleway", fontSize: 20, marginBottom: 16 }}>
              🔒 Locked ({badges.locked.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
              {badges.locked.map(badge => (
                <div
                  key={badge.id}
                  style={{
                    background: "#fafafa",
                    padding: 20,
                    borderRadius: 16,
                    textAlign: "center",
                    opacity: 0.6,
                    border: "1px solid #ddd",
                  }}
                >
                  <div style={{ fontSize: 56, marginBottom: 8, filter: "grayscale(100%)" }}>
                    {badge.icon}
                  </div>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 16, color: "#000", marginBottom: 4 }}>
                    {badge.name}
                  </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "Raleway", fontSize: 20, marginTop: 0, marginBottom: 16 }}>
              🏆 Top Students
            </h3>

            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                No students with points yet. Be the first! 🎯
              </div>
            ) : (
              <div>
                {leaderboard.map((student, idx) => {
                  const isMe = student.id === user?.id;
                  const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;

                  return (
                    <div
                      key={student.id}
                      className="leaderboard-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr 100px 80px 80px",
                        alignItems: "center",
                        padding: "16px 20px",
                        background: isMe ? "linear-gradient(135deg, #f4fae9, #fff)" : "transparent",
                        border: isMe ? "2px solid #8DC540" : "1px solid #f0f0f0",
                        borderRadius: 12,
                        marginBottom: 8,
                        gap: 16,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        {medal ? (
                          <span style={{ fontSize: 28 }}>{medal}</span>
                        ) : (
                          <span style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 20, color: "#666" }}>
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 16, color: "#000" }}>
                          {student.first_name} {student.last_name?.charAt(0)}.
                          {isMe && <span style={{ marginLeft: 8, color: "#8DC540", fontSize: 12 }}>(You)</span>}
                        </div>
                        <div style={{
                          fontFamily: "Raleway, sans-serif",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: 1.5,
                          color: student.tier === "premium" ? "#648C2D" : "#196AB4",
                          marginTop: 2,
                        }}>
                          {(student.tier || "standard").toUpperCase()}
                        </div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "#000" }}>
                          {student.lessons_completed}
                        </div>
                        <div style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat" }}>LESSONS</div>
                      </div>

                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 16, color: "#000" }}>
                          {student.badges_count} 🎖️
                        </div>
                        <div style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat" }}>BADGES</div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 800, fontSize: 22, color: "#8DC540" }}>
                          {student.total_points || 0}
                        </div>
                        <div style={{ fontSize: 10, color: "#888", fontFamily: "Montserrat" }}>POINTS</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}