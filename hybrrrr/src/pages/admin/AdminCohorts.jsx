import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UnlockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export default function AdminCohorts() {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  // Local state for unsaved changes
  const [edits, setEdits] = useState({});

  useEffect(() => {
    api.get("/admin/cohorts")
      .then(res => setCohorts(res.data.cohorts || []))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const getValue = (cohort, field) => {
    const editKey = `${cohort.id}_${field}`;
    return edits[editKey] !== undefined ? edits[editKey] : cohort[field];
  };

  const setValue = (cohortId, field, value) => {
    setEdits(prev => ({ ...prev, [`${cohortId}_${field}`]: value }));
  };

  const isDirty = (cohortId) => {
    return Object.keys(edits).some(key => key.startsWith(`${cohortId}_`));
  };

  const handleSave = async (cohort) => {
    const lockMode = getValue(cohort, "lock_mode");
    const maxUnlockedWeek = getValue(cohort, "max_unlocked_week");

    setSavingId(cohort.id);
    try {
      const res = await api.patch(`/admin/cohorts/${cohort.id}/lock`, {
        lock_mode: lockMode,
        max_unlocked_week: lockMode === "manual" ? maxUnlockedWeek : null,
      });

      // Update local cohort with new values
      setCohorts(prev => prev.map(c =>
        c.id === cohort.id
          ? { ...c, lock_mode: res.data.cohort.lock_mode, max_unlocked_week: res.data.cohort.max_unlocked_week }
          : c
      ));

      // Clear edits for this cohort
      setEdits(prev => {
        const newEdits = { ...prev };
        Object.keys(newEdits).forEach(key => {
          if (key.startsWith(`${cohort.id}_`)) delete newEdits[key];
        });
        return newEdits;
      });

      setSuccessId(cohort.id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      alert("Failed to save: " + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Cohorts</h1>
          <p className="admin-subtitle">Manage program cohorts and week unlock settings</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#666" }}>Loading cohorts...</div>
      ) : cohorts.length === 0 ? (
        <div style={{ background: "#fff", padding: 60, borderRadius: 12, textAlign: "center", color: "#666" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <h3 style={{ fontFamily: "Raleway", margin: 0 }}>No cohorts yet</h3>
          <p>Cohorts will appear here once they are created.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {cohorts.map(cohort => {
            const lockMode = getValue(cohort, "lock_mode");
            const maxUnlockedWeek = getValue(cohort, "max_unlocked_week");
            const dirty = isDirty(cohort.id);
            const saving = savingId === cohort.id;
            const success = successId === cohort.id;

            return (
              <div
                key={cohort.id}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Cohort header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 24,
                  gap: 24,
                  flexWrap: "wrap",
                }}>
                  <div>
                    <h2 style={{
                      fontFamily: "Raleway, sans-serif",
                      fontSize: 24,
                      fontWeight: 700,
                      margin: "0 0 8px 0",
                      color: "#000",
                    }}>
                      {cohort.name}
                    </h2>
                    <div style={{
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      color: "#888",
                      fontSize: 13,
                      fontFamily: "Montserrat, sans-serif",
                    }}>
                      <span>📅 Starts: {new Date(cohort.start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      <span>📆 {cohort.total_weeks} weeks total</span>
                      <span>👥 {cohort.student_count} students</span>
                    </div>
                  </div>

                  {/* Current status badge */}
                  <div style={{
                    padding: "8px 16px",
                    borderRadius: 100,
                    background: cohort.lock_mode === "manual" ? "#fff3cd" : "#d4edda",
                    color: cohort.lock_mode === "manual" ? "#856404" : "#155724",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontFamily: "Montserrat, sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    {cohort.lock_mode === "manual" ? <LockIcon /> : <UnlockIcon />}
                    {cohort.lock_mode === "manual" ? "Manual Lock" : "Auto (Date-Based)"}
                  </div>
                </div>

                {/* Lock mode controls */}
                <div style={{
                  background: "#FAFAFA",
                  border: "1px solid #EDEDED",
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 16,
                }}>
                  <div style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: 1.2,
                    color: "#000",
                    marginBottom: 16,
                  }}>
                    WEEK UNLOCK MODE
                  </div>

                  {/* Toggle buttons */}
                  <div style={{
                    display: "inline-flex",
                    background: "#fff",
                    border: "1px solid #DDD",
                    borderRadius: 100,
                    padding: 4,
                    marginBottom: 20,
                  }}>
                    <button
                      onClick={() => setValue(cohort.id, "lock_mode", "auto")}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 100,
                        background: lockMode === "auto" ? "#8DC540" : "transparent",
                        color: lockMode === "auto" ? "#000" : "#666",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      🕐 Auto (Date-Based)
                    </button>
                    <button
                      onClick={() => setValue(cohort.id, "lock_mode", "manual")}
                      style={{
                        padding: "10px 24px",
                        borderRadius: 100,
                        background: lockMode === "manual" ? "#8DC540" : "transparent",
                        color: lockMode === "manual" ? "#000" : "#666",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      🔒 Manual Lock
                    </button>
                  </div>

                  {/* Mode descriptions */}
                  {lockMode === "auto" && (
                    <div style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 13,
                      color: "#666",
                      lineHeight: 1.6,
                    }}>
                      ✅ Weeks unlock automatically based on the cohort start date.
                      Students see Week 1 immediately, Week 2 after 7 days, Week 3 after 14 days, etc.
                    </div>
                  )}

                  {lockMode === "manual" && (
                    <div>
                      <div style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        color: "#666",
                        lineHeight: 1.6,
                        marginBottom: 16,
                      }}>
                        🔒 Manually control which weeks are unlocked. All weeks above the selected one will be locked regardless of date.
                      </div>

                      <label style={{
                        display: "block",
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700,
                        fontSize: 11,
                        letterSpacing: 1.2,
                        color: "#000",
                        marginBottom: 8,
                      }}>
                        MAX UNLOCKED WEEK
                      </label>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(week => {
                          const isSelected = parseInt(maxUnlockedWeek) === week;
                          return (
                            <button
                              key={week}
                              onClick={() => setValue(cohort.id, "max_unlocked_week", week)}
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 12,
                                border: isSelected ? "2px solid #8DC540" : "1px solid #DDD",
                                background: isSelected ? "#8DC540" : "#fff",
                                color: isSelected ? "#000" : "#666",
                                cursor: "pointer",
                                fontFamily: "Montserrat, sans-serif",
                                fontWeight: 700,
                                fontSize: 16,
                                transition: "all 0.15s",
                              }}
                            >
                              {week}
                            </button>
                          );
                        })}
                      </div>

                      {maxUnlockedWeek && (
                        <div style={{
                          marginTop: 16,
                          padding: 12,
                          background: "#f4fae9",
                          border: "1px solid #c4e89a",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "#5a8a1a",
                          fontFamily: "Montserrat, sans-serif",
                        }}>
                          ✅ Students will see Weeks 1–{maxUnlockedWeek} unlocked.
                          {maxUnlockedWeek < 8 && ` Weeks ${parseInt(maxUnlockedWeek) + 1}–8 will be locked.`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
                  {success && (
                    <span style={{
                      color: "#5a8a1a",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                    }}>
                      ✅ Saved!
                    </span>
                  )}
                  <button
                    onClick={() => handleSave(cohort)}
                    disabled={!dirty || saving || (lockMode === "manual" && !maxUnlockedWeek)}
                    style={{
                      padding: "12px 28px",
                      background: dirty ? "#8DC540" : "#D5D5D5",
                      color: dirty ? "#000" : "#666",
                      border: "none",
                      borderRadius: 100,
                      cursor: dirty && !saving ? "pointer" : "not-allowed",
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}