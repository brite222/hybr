import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { CURRICULUM } from "../../data/curriculum";
import AdminLayout from "./AdminLayout";

// ── Icons ────────
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// ── Reusable Components ────────

const SectionCard = ({ title, children }) => (
  <div style={{
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  }}>
    {title && (
      <h3 style={{
        fontFamily: "Raleway, sans-serif",
        fontSize: 18,
        fontWeight: 600,
        margin: "0 0 16px 0",
        color: "#000",
      }}>
        {title}
      </h3>
    )}
    {children}
  </div>
);

const FormField = ({ label, hint, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{
      fontFamily: "Montserrat, sans-serif",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 0.5,
      color: "#000",
      textTransform: "uppercase",
      display: "block",
      marginBottom: 6,
    }}>
      {label}
    </label>
    {hint && (
      <p style={{
        fontFamily: "Montserrat, sans-serif",
        fontSize: 12,
        color: "#888",
        margin: "0 0 8px 0",
      }}>
        {hint}
      </p>
    )}
    {children}
  </div>
);

const TextInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #DDD",
      borderRadius: 8,
      fontFamily: "Montserrat, sans-serif",
      fontSize: 14,
      boxSizing: "border-box",
    }}
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    style={{
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #DDD",
      borderRadius: 8,
      fontFamily: "Montserrat, sans-serif",
      fontSize: 14,
      resize: "vertical",
      boxSizing: "border-box",
    }}
  />
);

// ── File Upload Component ────────
const FileUploader = ({ label, hint, accept, currentUrl, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/admin/content/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data.url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormField label={label} hint={hint}>
      {/* Current file preview */}
      {currentUrl && (
        <div style={{
          padding: 12,
          background: "#F5F9FF",
          border: "1px solid #C0DBFA",
          borderRadius: 8,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            color: "#196AB4",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 400,
          }}>
            ✓ Current: <strong>{currentUrl.split("/").pop()}</strong>
          </div>
          <button
            type="button"
            onClick={() => onUpload("")}
            style={{
              padding: "4px 10px",
              background: "transparent",
              color: "#C0392B",
              border: "1px solid #C0392B",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              fontFamily: "Montserrat, sans-serif",
            }}
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload button */}
      <label style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 14,
        border: "2px dashed #DDD",
        borderRadius: 8,
        cursor: uploading ? "not-allowed" : "pointer",
        background: uploading ? "#F5F5F5" : "#fff",
        fontFamily: "Montserrat, sans-serif",
        fontSize: 14,
        color: "#666",
      }}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <UploadIcon />
        {uploading ? "Uploading..." : currentUrl ? "Replace file" : "Click to upload"}
      </label>

      {error && (
        <div style={{
          padding: 8,
          background: "#FFE0E0",
          color: "#C0392B",
          borderRadius: 6,
          marginTop: 8,
          fontSize: 12,
        }}>
          {error}
        </div>
      )}
    </FormField>
  );
};

// ── List Editor (for objectives, references, resources) ────────
const ListEditor = ({ items, onChange, placeholder }) => {
  const list = items || [];

  const addItem = () => onChange([...list, ""]);
  const removeItem = (idx) => onChange(list.filter((_, i) => i !== idx));
  const updateItem = (idx, value) => {
    const updated = [...list];
    updated[idx] = value;
    onChange(updated);
  };

  return (
    <div>
      {list.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <TextInput
            value={item}
            onChange={(v) => updateItem(idx, v)}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            style={{
              padding: "0 12px",
              background: "transparent",
              color: "#C0392B",
              border: "1px solid #C0392B",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          background: "transparent",
          color: "#196AB4",
          border: "1px dashed #196AB4",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <PlusIcon /> Add Item
      </button>
    </div>
  );
};

// ── Quiz Editor ────────
const QuizEditor = ({ questions, onChange }) => {
  const qs = questions || [];

  const addQuestion = () => {
    onChange([
      ...qs,
      {
        q: "",
        options: ["", "", "", ""],
        correct: 0,
        hint: "",
      },
    ]);
  };

  const updateQuestion = (idx, field, value) => {
    const updated = [...qs];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = [...qs];
    updated[qIdx].options[optIdx] = value;
    onChange(updated);
  };

  const removeQuestion = (idx) => {
    onChange(qs.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {qs.map((q, qIdx) => (
        <div
          key={qIdx}
          style={{
            border: "1px solid #DDD",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            background: "#FAFAFA",
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <strong style={{ fontFamily: "Raleway, sans-serif", fontSize: 14 }}>
              Question {qIdx + 1}
            </strong>
            <button
              type="button"
              onClick={() => removeQuestion(qIdx)}
              style={{
                padding: 6,
                background: "transparent",
                color: "#C0392B",
                border: "1px solid #C0392B",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              <TrashIcon />
            </button>
          </div>

          <FormField label="Question Text">
            <TextArea
              value={q.q}
              onChange={(v) => updateQuestion(qIdx, "q", v)}
              placeholder="Enter the question..."
              rows={2}
            />
          </FormField>

          <FormField label="Options (select the correct one)">
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} style={{
                display: "flex",
                gap: 8,
                marginBottom: 6,
                alignItems: "center",
              }}>
                <input
                  type="radio"
                  name={`correct-${qIdx}`}
                  checked={q.correct === optIdx}
                  onChange={() => updateQuestion(qIdx, "correct", optIdx)}
                  style={{ flexShrink: 0 }}
                />
                <span style={{ fontWeight: 600, minWidth: 20 }}>
                  {String.fromCharCode(65 + optIdx)}.
                </span>
                <TextInput
                  value={opt}
                  onChange={(v) => updateOption(qIdx, optIdx, v)}
                  placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                />
              </div>
            ))}
          </FormField>

          <FormField label="Hint (shown after submission)">
            <TextInput
              value={q.hint}
              onChange={(v) => updateQuestion(qIdx, "hint", v)}
              placeholder="💡 Tip: ..."
            />
          </FormField>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 18px",
          background: "#196AB4",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <PlusIcon /> Add Question
      </button>
    </div>
  );
};

// ── References Editor (objects with title + url) ────────
const ReferencesEditor = ({ items, onChange }) => {
  const list = items || [];

  const addItem = () => onChange([...list, { title: "", url: "" }]);
  const removeItem = (idx) => onChange(list.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div>
      {list.map((item, idx) => (
        <div key={idx} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: 8,
          marginBottom: 8,
        }}>
          <TextInput
            value={item.title}
            onChange={(v) => updateItem(idx, "title", v)}
            placeholder="Title"
          />
          <TextInput
            value={item.url}
            onChange={(v) => updateItem(idx, "url", v)}
            placeholder="https://..."
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            style={{
              padding: "0 12px",
              background: "transparent",
              color: "#C0392B",
              border: "1px solid #C0392B",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 14px",
          background: "transparent",
          color: "#196AB4",
          border: "1px dashed #196AB4",
          borderRadius: 8,
          cursor: "pointer",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <PlusIcon /> Add Reference
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function AdminContentEditor() {
  const { weekNumber, lessonId } = useParams();
  const navigate = useNavigate();

  const week = CURRICULUM[weekNumber];
  const lesson = week?.lessons?.find(l => l.id === lessonId);

  const [content, setContent] = useState({
  week_number: parseInt(weekNumber),
  lesson_id: lessonId,
  lesson_type: lesson?.type || "module",
  title: "",
  subtitle: "",
  duration: lesson?.duration || "",
  header: "",
  body_text: "",
  body_text_2: "",
  program_track: "",
  video_url: "",
  audio_url: "",
  image_url: "",
  pdf_url: "",
  image_caption: "",
  quiz_data: [],
  objectives_json: [],
  references_json: [],
  resources_json: [],
  transcript_json: [],
  survey_url: "", 
});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load existing content
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/content/${weekNumber}/${lessonId}`);
        if (res.data.content) {
          setContent({
            ...res.data.content,
            // Parse JSON fields if they're strings
            quiz_data: res.data.content.quiz_data || [],
            objectives_json: res.data.content.objectives_json || [],
            references_json: res.data.content.references_json || [],
            resources_json: res.data.content.resources_json || [],
            transcript_json: res.data.content.transcript_json || [],
          });
        } else {
          // No existing content — pre-fill defaults
          setContent(prev => ({
            ...prev,
            title: lesson?.title || "",
            duration: lesson?.duration || "",
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [weekNumber, lessonId, lesson]);

  const updateField = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    
    try {
      await api.post("/admin/content", content);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!week || !lesson) {
    return (
      <AdminLayout>
        <div style={{ padding: 40 }}>
          <h2>Lesson not found</h2>
          <button onClick={() => navigate("/admin/content")}>Back to Content</button>
        </div>
      </AdminLayout>
    );
  }

  const lessonType = lesson.type;

  return (
    <AdminLayout>
      {/* Back button */}
      <button
        onClick={() => navigate("/admin/content")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "#196AB4",
          cursor: "pointer",
          marginBottom: 16,
          fontSize: 14,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 500,
          padding: 0,
        }}
      >
        <ArrowLeft /> Back to Content Manager
      </button>

      <div className="admin-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 2,
            color: "#196AB4",
            marginBottom: 4,
            textTransform: "uppercase",
          }}>
            WEEK {weekNumber} • {lessonType}
          </div>
          <h1 className="admin-title">Edit: {lesson.title}</h1>
          <p className="admin-subtitle">{lesson.duration} • Lesson Type: {lessonType}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ minWidth: 140 }}
        >
          {saving ? "Saving..." : "💾 Save Content"}
        </button>
      </div>

      {success && (
        <div style={{
          background: "#D4EDDA",
          color: "#155724",
          padding: 14,
          borderRadius: 8,
          marginBottom: 16,
          fontFamily: "Montserrat, sans-serif",
        }}>
          ✅ Content saved successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {loading ? (
        <div className="coach-loading" style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center" }}>
          Loading content...
        </div>
      ) : (
        <>
          {/* ── BASIC INFO (all lesson types) ── */}
          <SectionCard title="Basic Info">
            <FormField label="Title" hint="Shown in the lesson banner">
              <TextInput
                value={content.title}
                onChange={(v) => updateField("title", v)}
                placeholder="e.g., Title of Lesson, Lorem Ipsum Dolor"
              />
            </FormField>

            <FormField label="Subtitle" hint="Brief description below the title">
              <TextInput
                value={content.subtitle}
                onChange={(v) => updateField("subtitle", v)}
                placeholder="A brief summarising statement..."
              />
            </FormField>

            <FormField label="Duration" hint="e.g., 7 MIN, 12 MINUTES">
              <TextInput
                value={content.duration}
                onChange={(v) => updateField("duration", v)}
                placeholder="7 MIN"
              />
            </FormField>
          </SectionCard>

          {/* ── VIDEO UPLOAD (video lessons) ── */}
          {lessonType === "video" && (
            <SectionCard title="Video">
              <FileUploader
                label="Video File"
                hint="Upload MP4 video (max 100MB)"
                accept="video/*"
                currentUrl={content.video_url}
                onUpload={(url) => updateField("video_url", url)}
              />
            </SectionCard>
          )}

          {/* ── AUDIO UPLOAD (audio lessons) ── */}
          {lessonType === "audio" && (
            <SectionCard title="Audio">
              <FileUploader
                label="Audio File"
                hint="Upload MP3 audio (max 100MB)"
                accept="audio/*"
                currentUrl={content.audio_url}
                onUpload={(url) => updateField("audio_url", url)}
              />
            </SectionCard>
          )}

          {/* ── PDF UPLOAD (download lessons) ── */}
          {lessonType === "download" && (
            <SectionCard title="Download File">
              <FileUploader
                label="PDF File"
                hint="The file students will download"
                accept="application/pdf"
                currentUrl={content.pdf_url}
                onUpload={(url) => updateField("pdf_url", url)}
              />
            </SectionCard>
          )}

          {/* ── IMAGE UPLOAD (image/module/info lessons) ── */}
          {(lessonType === "image" || lessonType === "module" || lessonType === "info") && (
            <SectionCard title="Lesson Image">
              <FileUploader
                label="Image"
                hint="Main image for the lesson"
                accept="image/*"
                currentUrl={content.image_url}
                onUpload={(url) => updateField("image_url", url)}
              />
              {(lessonType === "image" || lessonType === "info") && (
                <FormField label="Image Caption">
                  <TextInput
                    value={content.image_caption}
                    onChange={(v) => updateField("image_caption", v)}
                    placeholder="IMAGE DESCRIPTION, LOCATION, AND MORE - AS REQUIRED"
                  />
                </FormField>
              )}
            </SectionCard>
          )}

          {/* ── TEXT CONTENT (most lesson types except quiz, upload, feedback) ── */}
          {!["quiz", "upload", "feedback"].includes(lessonType) && (
            <SectionCard title="Text Content">
              <FormField label="Section Header">
                <TextInput
                  value={content.header}
                  onChange={(v) => updateField("header", v)}
                  placeholder="Header, Lorem Ipsum Dolor Sit Amet"
                />
              </FormField>

              <FormField label="Main Body Text">
                <TextArea
                  value={content.body_text}
                  onChange={(v) => updateField("body_text", v)}
                  placeholder="Main body content..."
                  rows={6}
                />
              </FormField>

              <FormField label="Additional Body Text (optional)">
                <TextArea
                  value={content.body_text_2}
                  onChange={(v) => updateField("body_text_2", v)}
                  placeholder="More body content..."
                  rows={6}
                />
              </FormField>

              {lessonType === "module" && (
                <FormField label="Program Track/Theme">
                  <TextInput
                    value={content.program_track}
                    onChange={(v) => updateField("program_track", v)}
                    placeholder="PROGRAM TRACK/THEME"
                  />
                </FormField>
              )}
            </SectionCard>
          )}

          {/* ── QUIZ EDITOR ── */}
          {lessonType === "quiz" && (
            <SectionCard title="Quiz Questions">
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
                color: "#666",
                marginTop: 0,
                marginBottom: 16,
              }}>
                Add at least 1 question. Click the radio button next to the correct answer.
              </p>
              <QuizEditor
                questions={content.quiz_data}
                onChange={(v) => updateField("quiz_data", v)}
              />
            </SectionCard>
          )}

          {/* ── TRANSCRIPT (video, audio lessons) ── */}
          {(lessonType === "video" || lessonType === "audio") && (
            <SectionCard title="Transcript">
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
                color: "#666",
                marginTop: 0,
                marginBottom: 12,
              }}>
                Add each paragraph of the transcript as a separate item.
              </p>
              <ListEditor
                items={content.transcript_json}
                onChange={(v) => updateField("transcript_json", v)}
                placeholder="Transcript paragraph..."
              />
            </SectionCard>
          )}

          {/* ── OBJECTIVES ── */}
          {!["upload", "feedback"].includes(lessonType) && (
            <SectionCard title="Objectives">
              <ListEditor
                items={content.objectives_json}
                onChange={(v) => updateField("objectives_json", v)}
                placeholder="An objective for this lesson..."
              />
            </SectionCard>
          )}

          {/* ── REFERENCES (image, info, module lessons) ── */}
          {(lessonType === "image" || lessonType === "info" || lessonType === "module") && (
            <SectionCard title="References">
              <ReferencesEditor
                items={content.references_json}
                onChange={(v) => updateField("references_json", v)}
              />
            </SectionCard>
          )}

          {/* ── FURTHER RESOURCES ── */}
          {(lessonType === "image" || lessonType === "info" || lessonType === "module") && (
            <SectionCard title="Further Resources">
              <p style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
                color: "#666",
                marginTop: 0,
                marginBottom: 12,
              }}>
                Add quotes, book titles, or URLs.
              </p>
              <ListEditor
                items={content.resources_json}
                onChange={(v) => updateField("resources_json", v)}
                placeholder='e.g., "Book Title", by Author Name'
              />
            </SectionCard>
          )}

          {/* ── UPLOAD/FEEDBACK INSTRUCTIONS ── */}
          {(lessonType === "upload" || lessonType === "feedback") && (
            <SectionCard title="Instructions">
              <FormField 
                label="Instructions for Student" 
                hint={lessonType === "upload" 
                  ? "Tell the student what to upload" 
                  : "Link or instructions to your Google Form"}
              >
                <TextArea
                  value={content.body_text}
                  onChange={(v) => updateField("body_text", v)}
                  placeholder={lessonType === "upload" 
                    ? "Upload your filled work assignment as PDF..." 
                    : "Please complete the feedback form at..."}
                  rows={4}
                />
              </FormField>
            </SectionCard>
          )}
            {/* ── SURVEY URL (feedback lessons only) ── */}
{lessonType === "feedback" && (
  <SectionCard title="📋 External Survey">
    <FormField
      label="Survey URL"
      hint="Paste the link to your Google Form, Typeform, or any external survey. Students will see a green 'Take the Survey' button. If left empty, no survey card is shown and no bonus is offered."
    >
      <TextInput
        value={content.survey_url}
        onChange={(v) => updateField("survey_url", v)}
        placeholder="https://forms.gle/your-survey-link"
      />
    </FormField>

    <div style={{
      marginTop: 12,
      padding: "12px 16px",
      background: "#F0F9E8",
      border: "1px solid #8DC540",
      borderRadius: 8,
      fontFamily: "Montserrat, sans-serif",
      fontSize: 12,
      color: "#555",
      lineHeight: 1.6,
    }}>
      <strong style={{ color: "#5a8a1a" }}>💡 How it works:</strong>
      <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
        <li>Students see a green <strong>"Take the Survey"</strong> link in the References panel.</li>
        <li>A <strong>Yes/No question</strong> appears asking if they've completed it.</li>
        <li>If they click <strong>Yes</strong>, they earn <strong style={{ color: "#5a8a1a" }}>+3 bonus points</strong> on top of the regular 3 feedback points.</li>
        <li>Leave the URL empty to disable the survey for this lesson.</li>
      </ul>
    </div>
  </SectionCard>
)}
          {/* ── BOTTOM SAVE BUTTON ── */}
          <div style={{
            position: "sticky",
            bottom: 0,
            background: "#f5f5f5",
            padding: "16px 0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
          }}>
            <button
              onClick={() => navigate("/admin/content")}
              style={{
                padding: "12px 24px",
                background: "#fff",
                border: "1px solid #DDD",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
              style={{ minWidth: 160 }}
            >
              {saving ? "Saving..." : "💾 Save Content"}
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}