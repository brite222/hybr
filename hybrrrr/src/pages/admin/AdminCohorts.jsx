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

  // Local state for unsaved changes (lock mode)
  const [edits, setEdits] = useState({});

  // ✅ NEW: Create cohort form state
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [newCohort, setNewCohort] = useState({
    name: "",
    startDate: "",
    totalWeeks: 8,
  });

  // ✅ Load cohorts
  const loadCohorts = () => {
    setLoading(true);
    api.get("/admin/cohorts")
      .then(res => setCohorts(res.data.cohorts || []))
      .catch(err => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  // ✅ NEW: Create cohort handler
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCohort.name || !newCohort.startDate) {
      alert("Please fill in name and start date");
      return;
    }

    setCreating(true);
    try {
      await api.post("/admin/cohorts", {
        name: newCohort.name,
        startDate: newCohort.startDate,
        totalWeeks: parseInt(newCohort.totalWeeks) || 8,
      });
      setCreateSuccess(true);
      setNewCohort({ name: "", startDate: "", totalWeeks: 8 });
      setTimeout(() => {
        setCreateSuccess(false);
        setShowForm(false);
        loadCohorts(); // reload list
      }, 1500);
    } catch (err) {
      alert("Failed to create cohort: " + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  // ── Lock mode helpers ──
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

      setCohorts(prev => prev.map(c =>
        c.id === cohort.id
          ? { ...c, lock_mode: res.data.cohort.lock_mode, max_unlocked_week: res.data.cohort.max_unlocked_week }
          : c
      ));

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
      {/* ── PAGE HEADER with Create button ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            color: "#000",
          }}>
            Cohorts
          </h1>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            color: "#666",
            margin: "4px 0 0 0",
          }}>
            Manage program cohorts and week unlock settings
          </p>
        </div>

        {/* ✅ Create button — always visible */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "12px 24px",
            background: showForm ? "#C0392B" : "#8DC540",
            color: "#fff",
            border: "none",
            borderRadius: 100,
            cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.5,
            transition: "background 0.2s",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Create Cohort"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── CREATE COHORT FORM ── */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#fff",
            padding: 28,
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h3 style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 20,
            fontWeight: 600,
            margin: "0 0 20px 0",
            color: "#000",
          }}>
            New Cohort
          </h3>

          {createSuccess && (
            <div style={{
              background: "#d4edda",
              color: "#155724",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontFamily: "Montserrat, sans-serif",
              fontSize: 14,
            }}>
              ✅ Cohort created successfully!
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>COHORT NAME *</label>
            <input
              type="text"
              value={newCohort.name}
              onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
              placeholder="e.g., ALPHA 2026 Summer"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>START DATE *</label>
              <input
                type="date"
                value={newCohort.startDate}
                onChange={(e) => setNewCohort({ ...newCohort, startDate: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>TOTAL WEEKS</label>
              <input
                type="number"
                min="1"
                max="52"
                value={newCohort.totalWeeks}
                onChange={(e) => setNewCohort({ ...newCohort, totalWeeks: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "14px 32px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              cursor: creating ? "not-allowed" : "pointer",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              opacity: creating ? 0.6 : 1,
              width: "100%",
            }}
          >
            {creating ? "Creating..." : "📚 Create Cohort"}
          </button>
        </form>
      )}

      {/* ── COHORTS LIST ── */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#666", fontFamily: "Montserrat, sans-serif" }}>
          Loading cohorts...
        </div>
      ) : cohorts.length === 0 ? (
        <div style={{
          background: "#fff",
          padding: 60,
          borderRadius: 16,
          textAlign: "center",
          color: "#666",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <h3 style={{
            fontFamily: "Raleway, sans-serif",
            margin: "0 0 8px 0",
            color: "#000",
          }}>
            No cohorts yet
          </h3>
          <p style={{ fontFamily: "Montserrat, sans-serif", fontSize: 14, margin: 0 }}>
            Click <strong>"+ Create Cohort"</strong> above to add your first one!
          </p>
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

                  <div style={{
                    display: "inline-flex",
                    background: "#fff",
                    border: "1px solid #DDD",
                    borderRadius: 100,
                    padding: 4,
                    marginBottom: 20,
                    flexWrap: "wrap",
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

// ── Reusable styles ──
const labelStyle = {
  display: "block",
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: 1,
  color: "#000",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1px solid #DDD",
  borderRadius: 8,
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  color: "#000",
  outline: "none",
  boxSizing: "border-box",
};