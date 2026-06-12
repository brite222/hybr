import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    meeting_link: "",
    scheduled_at: "",
    cohort_id: "",
  });

  const loadData = () => {
    Promise.all([
      api.get("/classes"),
      api.get("/admin/cohorts"),
    ])
      .then(([cls, ch]) => {
        setClasses(cls.data.classes || []);
        setCohorts(ch.data.cohorts || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/classes/${editingId}`, form);
      } else {
        await api.post("/classes", form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: "", description: "", meeting_link: "", scheduled_at: "", cohort_id: "" });
      loadData();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description || "",
      meeting_link: c.meeting_link || "",
      scheduled_at: new Date(c.scheduled_at).toISOString().slice(0, 16),
      cohort_id: c.cohort_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this class?")) return;
    await api.delete(`/classes/${id}`);
    loadData();
  };

  const upcoming = classes.filter(c => new Date(c.scheduled_at) >= new Date());
  const past = classes.filter(c => new Date(c.scheduled_at) < new Date());

  return (
    <AdminLayout>
      {/* ── PAGE HEADER ── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        gap: 16,
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
            📅 Scheduled Classes
          </h1>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            color: "#666",
            margin: "4px 0 0 0",
          }}>
            Schedule classes and auto-send reminders 24h + 1h before.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ title: "", description: "", meeting_link: "", scheduled_at: "", cohort_id: "" });
          }}
          style={{
            padding: "12px 24px",
            background: showForm ? "#C0392B" : "#8DC540",
            color: "#fff",
            border: "none",
            borderRadius: 100,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.5,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          {showForm ? "✕ Cancel" : "+ Schedule Class"}
        </button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
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
            {editingId ? "Edit Class" : "Schedule New Class"}
          </h3>

          {/* Title */}
          <FormField label="TITLE *">
            <TextInput
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
              placeholder="e.g., Office Hours"
              required
            />
          </FormField>

          {/* Description */}
          <FormField label="DESCRIPTION">
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will you cover?"
              style={textareaStyle}
            />
          </FormField>

          {/* Meeting Link */}
          <FormField label="MEETING LINK">
            <TextInput
              type="url"
              value={form.meeting_link}
              onChange={(v) => setForm({ ...form, meeting_link: v })}
              placeholder="https://zoom.us/..."
            />
          </FormField>

          {/* Date & Cohort */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <FormField label="DATE & TIME *" inline>
              <input
                type="datetime-local"
                required
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                style={inputStyle}
              />
            </FormField>
            <FormField label="COHORT *" inline>
              <select
                required
                value={form.cohort_id}
                onChange={(e) => setForm({ ...form, cohort_id: e.target.value })}
                style={inputStyle}
              >
                <option value="">— Select cohort —</option>
                {cohorts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.student_count} students)
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <button
            type="submit"
            style={{
              padding: "14px 32px",
              background: "#000",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {editingId ? "💾 Update Class" : "📅 Schedule Class"}
          </button>
        </form>
      )}

      {/* ── LIST ── */}
      {loading ? (
        <div style={{
          padding: 60,
          textAlign: "center",
          fontFamily: "Montserrat, sans-serif",
          color: "#666",
        }}>
          Loading...
        </div>
      ) : (
        <>
          {/* UPCOMING */}
          <h2 style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 14px 0",
            color: "#000",
          }}>
            📆 Upcoming ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: "center",
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 14,
              color: "#888",
            }}>
              No upcoming classes. Schedule one above!
            </div>
          ) : (
            upcoming.map(c => <ClassRow key={c.id} c={c} onEdit={handleEdit} onDelete={handleDelete} />)
          )}

          {/* PAST */}
          {past.length > 0 && (
            <>
              <h2 style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: 20,
                fontWeight: 700,
                margin: "32px 0 14px 0",
                color: "#999",
              }}>
                📜 Past ({past.length})
              </h2>
              {past.slice(0, 10).map(c => (
                <ClassRow key={c.id} c={c} onEdit={handleEdit} onDelete={handleDelete} isPast />
              ))}
            </>
          )}
        </>
      )}
    </AdminLayout>
  );
}

// ── Class Row ──
function ClassRow({ c, onEdit, onDelete, isPast }) {
  const date = new Date(c.scheduled_at);
  return (
    <div style={{
      background: "#fff",
      padding: 22,
      borderRadius: 12,
      marginBottom: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      opacity: isPast ? 0.6 : 1,
      borderLeft: `4px solid ${isPast ? "#ccc" : "#8DC540"}`,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          {/* Title — Raleway */}
          <h3 style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 18,
            fontWeight: 600,
            margin: "0 0 8px 0",
            color: "#000",
          }}>
            {c.title}
          </h3>

          {/* Date + Cohort — Montserrat */}
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            color: "#666",
            marginBottom: 8,
          }}>
            🗓️ {date.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            &nbsp;•&nbsp; 👥 {c.cohort_name} ({c.student_count} students)
          </div>

          {/* Description — Montserrat */}
          {c.description && (
            <p style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              color: "#555",
              margin: "8px 0",
              lineHeight: 1.5,
            }}>
              {c.description}
            </p>
          )}

          {/* Meeting link — Montserrat */}
          {c.meeting_link && (
            <a
              href={c.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "Montserrat, sans-serif",
                color: "#196AB4",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-block",
                marginTop: 4,
              }}
            >
              🔗 {c.meeting_link}
            </a>
          )}

          {/* Notification status — Montserrat */}
          {!isPast && (
            <div style={{
              marginTop: 10,
              fontFamily: "Montserrat, sans-serif",
              fontSize: 11,
              color: "#888",
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}>
              <span>{c.notified_24h ? "✅ 24h reminder sent" : "⏳ 24h reminder pending"}</span>
              <span>{c.notified_1h ? "✅ 1h reminder sent" : "⏳ 1h reminder pending"}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {!isPast && (
            <button
              onClick={() => onEdit(c)}
              style={actionButtonStyle}
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onDelete(c.id)}
            style={{ ...actionButtonStyle, borderColor: "#C0392B", color: "#C0392B" }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable Form Field ──
function FormField({ label, children, inline }) {
  return (
    <div style={{ marginBottom: inline ? 0 : 18 }}>
      <label style={{
        display: "block",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        color: "#000",
        marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Reusable Text Input ──
function TextInput({ value, onChange, placeholder, required, type = "text" }) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

// ── Shared styles ──
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

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 80,
};

const actionButtonStyle = {
  padding: "8px 16px",
  border: "1px solid #DDD",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontFamily: "Montserrat, sans-serif",
  fontSize: 12,
  fontWeight: 600,
  color: "#000",
  transition: "all 0.15s",
};