import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import CoachLayout from "./CoachLayout";

const UserIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ── Progress Ring ──
function ProgressRing({ percent, size = 90, strokeWidth = 8 }) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;
  const color = safePercent >= 75 ? "#8DC540" : safePercent >= 40 ? "#F0AD4E" : "#E74C3C";

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
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 700,
        fontSize: 22,
        color: safePercent === 0 ? "#999" : "#000",
      }}>
        {safePercent}%
      </div>
    </div>
  );
}

// ── Yes / No toggle ──
function YesNoToggle({ value, onChange }) {
  // value: true | false | null
  const baseBtn = {
    flex: 1,
    padding: "10px 18px",
    border: "1px solid #DDD",
    fontFamily: "Montserrat, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
    background: "#fff",
    color: "#666",
  };
  return (
    <div style={{ display: "flex", gap: 0, width: 180 }}>
      <button
        type="button"
        onClick={() => onChange(true)}
        style={{
          ...baseBtn,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          borderRight: "none",
          background: value === true ? "#8DC540" : "#fff",
          color: value === true ? "#fff" : "#666",
          borderColor: value === true ? "#8DC540" : "#DDD",
        }}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        style={{
          ...baseBtn,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          background: value === false ? "#C0392B" : "#fff",
          color: value === false ? "#fff" : "#666",
          borderColor: value === false ? "#C0392B" : "#DDD",
        }}
      >
        No
      </button>
    </div>
  );
}

export default function CoachGradeStudent() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState({
    criterion_1: "",
    criterion_2: "",
    criterion_3: "",
    criterion_4: "",
    criterion_5: "",
    feedback: "",
    attended_office_hours: null, // null | true | false
    presented: null,             // null | true | false
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/coach/grading")
      .then(res => {
        const found = res.data.submissions.find(s => s.id === parseInt(submissionId));
        if (found) {
          setSubmission(found);
          if (found.is_graded) {
            setGrades({
              criterion_1: found.criterion_1 || "",
              criterion_2: found.criterion_2 || "",
              criterion_3: found.criterion_3 || "",
              criterion_4: found.criterion_4 || "",
              criterion_5: found.criterion_5 || "",
              feedback: found.feedback || "",
              attended_office_hours: found.attended_office_hours ?? null,
              presented: found.presented ?? null,
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [submissionId]);

  const handleDownload = async () => {
    try {
      const response = await api.get(`/submissions/file/${submission.file_path}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.file_name || 'submission.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleGradeChange = (criterion, value) => {
    if (value === "") {
      setGrades(prev => ({ ...prev, [criterion]: "" }));
      return;
    }
    const num = parseInt(value);
    if (num >= 1 && num <= 5) {
      setGrades(prev => ({ ...prev, [criterion]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFilled = ["criterion_1", "criterion_2", "criterion_3", "criterion_4", "criterion_5"]
      .every(c => grades[c] !== "");

    if (!allFilled) {
      alert("Please grade all 5 criteria (1-5)");
      return;
    }

    if (grades.attended_office_hours === null) {
      alert("Please indicate whether the student attended office hours");
      return;
    }

    if (grades.presented === null) {
      alert("Please indicate whether the student presented");
      return;
    }

    setSaving(true);
    try {
      await api.post(`/coach/grading/${submissionId}`, {
        criterion_1: parseInt(grades.criterion_1),
        criterion_2: parseInt(grades.criterion_2),
        criterion_3: parseInt(grades.criterion_3),
        criterion_4: parseInt(grades.criterion_4),
        criterion_5: parseInt(grades.criterion_5),
        feedback: grades.feedback,
        attended_office_hours: grades.attended_office_hours,
        presented: grades.presented,
      });
      setSuccess(true);
      setTimeout(() => navigate("/coach/grading"), 1500);
    } catch (err) {
      alert("Failed to save grade: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <CoachLayout>
        <div className="coach-loading">Loading...</div>
      </CoachLayout>
    );
  }

  if (!submission) {
    return (
      <CoachLayout>
        <div className="coach-empty">
          <div className="coach-empty-icon">⚠️</div>
          <div className="coach-empty-title">Submission not found</div>
        </div>
      </CoachLayout>
    );
  }

  // ── Score calculations ──
  const criteriaTotal = ["criterion_1", "criterion_2", "criterion_3", "criterion_4", "criterion_5"]
    .reduce((sum, c) => sum + (parseInt(grades[c]) || 0), 0);

  const officeHoursPoints =
    grades.attended_office_hours === true ? 2 :
    grades.attended_office_hours === false ? -2 : 0;

  const presentationPoints = grades.presented === true ? 5 : 0;

  const totalScore = criteriaTotal + officeHoursPoints + presentationPoints;
  const maxScore = 32; // 25 + 2 + 5
  const percent = Math.round((Math.max(0, totalScore) / maxScore) * 100);

  const studentName = `${submission.first_name} ${submission.last_name}`;

  return (
    <CoachLayout>
      {/* Back button */}
      <button
        onClick={() => navigate("/coach/grading")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "#196AB4",
          cursor: "pointer",
          marginBottom: 24,
          fontSize: 14,
          fontFamily: "Montserrat, sans-serif",
          fontWeight: 500,
          padding: 0,
        }}
      >
        <ArrowLeft /> Back to Grading
      </button>

      {success && (
        <div style={{
          background: "#d4edda",
          color: "#155724",
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          fontFamily: "Montserrat, sans-serif",
        }}>
          ✅ Grade saved successfully! Redirecting...
        </div>
      )}

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
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
          flex: 1,
        }}>
          <div style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}>
            <UserIcon />
          </div>
          <div style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 2,
            color: submission.tier === "premium" ? "#648C2D" : "#196AB4",
          }}>
            {(submission.tier || "standard").toUpperCase()} TIER
          </div>
          <h1 style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            margin: 0,
            color: "#000",
            lineHeight: 1.1,
          }}>
            {studentName}
          </h1>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <ProgressRing percent={percent} size={120} strokeWidth={10} />
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: "#666",
          }}>
            {totalScore} / {maxScore} pts
          </div>
        </div>
      </div>

      {/* ── SUBMISSION + DOWNLOAD CARD ── */}
      <div style={{
        background: "#fff",
        padding: 24,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}>
          <div style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 13,
            color: "#666",
          }}>
            {submission.file_name} • {(submission.file_size / 1024).toFixed(0)} KB
          </div>
          <span style={{
            padding: "8px 20px",
            borderRadius: 6,
            background: "#8DC540",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            fontFamily: "Montserrat, sans-serif",
          }}>
            SUBMITTED
          </span>
        </div>

        <button
          onClick={handleDownload}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            padding: 16,
            background: "#fff",
            border: "1px solid #D5D5D5",
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: "#000",
          }}
        >
          <DownloadIcon /> Download Student Submission
        </button>
      </div>

      {/* ── ASSIGNMENT TITLE + RUBRIC ── */}
      <div style={{
        background: "#fff",
        padding: 32,
        borderRadius: 16,
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}>
        <h2 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 12px 0",
          color: "#000",
        }}>
          Assignment Title, Lorem Ipsum Dolor
        </h2>
        <p style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 14,
          color: "#666",
          lineHeight: 1.5,
          margin: "0 0 28px 0",
        }}>
          About the assignment. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Vestibulum aliquam tellus sit amet eros maximus gravida. Vestibulum sit amet nisl libero.
        </p>

        <h3 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 18,
          fontWeight: 600,
          margin: "0 0 16px 0",
          color: "#000",
        }}>
          Grading Rubric/Criteria
        </h3>

        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} style={{ marginBottom: 14 }}>
            <div style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              color: "#000",
              marginBottom: 4,
            }}>
              CRITERION {n}
            </div>
            <div style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 13,
              color: "#555",
              lineHeight: 1.5,
            }}>
              Criteria Details. Aliquam dignissim, dui vel auctor congue, ipsum sem interdum magna.
            </div>
          </div>
        ))}
      </div>

      {/* ── GRADE THIS STUDENT ── */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <h3 style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          margin: "0 0 24px 0",
          color: "#000",
        }}>
          Grade This Student
        </h3>

        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 20px",
              border: "1px solid #EDEDED",
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <label style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "#000",
            }}>
              Criterion {n}
            </label>
            <input
              type="number"
              min="1"
              max="5"
              placeholder="1-5"
              value={grades[`criterion_${n}`]}
              onChange={(e) => handleGradeChange(`criterion_${n}`, e.target.value)}
              className="always-show-arrows"
              style={{
                width: 70,
                padding: "10px 14px",
                border: "1px solid #DDD",
                borderRadius: 8,
                textAlign: "center",
                fontSize: 14,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                color: "#666",
              }}
              required
            />
          </div>
        ))}

        {/* ── BONUS / PENALTY SECTION ── */}
        <div style={{
          marginTop: 28,
          marginBottom: 8,
          paddingTop: 24,
          borderTop: "1px solid #EDEDED",
        }}>
          <h4 style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            margin: "0 0 6px 0",
            color: "#000",
          }}>
            Participation & Presentation
          </h4>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            color: "#888",
            margin: "0 0 18px 0",
          }}>
            These adjust the final score automatically.
          </p>

          {/* Office Hours */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            border: "1px solid #EDEDED",
            borderRadius: 10,
            marginBottom: 12,
          }}>
            <div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#000",
              }}>
                Attended Office Hours?
              </div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                color: "#888",
                marginTop: 2,
              }}>
                Yes = +2 pts &nbsp;•&nbsp; No = −2 pts
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: officeHoursPoints > 0 ? "#5a8a1a" : officeHoursPoints < 0 ? "#C0392B" : "#888",
                minWidth: 36,
                textAlign: "right",
              }}>
                {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
              </span>
              <YesNoToggle
                value={grades.attended_office_hours}
                onChange={(v) => setGrades(prev => ({ ...prev, attended_office_hours: v }))}
              />
            </div>
          </div>

          {/* Presentation */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            border: "1px solid #EDEDED",
            borderRadius: 10,
            marginBottom: 12,
          }}>
            <div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: "#000",
              }}>
                Presented?
              </div>
              <div style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                color: "#888",
                marginTop: 2,
              }}>
                Yes = +5 pts &nbsp;•&nbsp; No = 0 pts
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: presentationPoints > 0 ? "#5a8a1a" : "#888",
                minWidth: 36,
                textAlign: "right",
              }}>
                {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
              </span>
              <YesNoToggle
                value={grades.presented}
                onChange={(v) => setGrades(prev => ({ ...prev, presented: v }))}
              />
            </div>
          </div>
        </div>

        {/* ── SCORE SUMMARY ── */}
        <div style={{
          marginTop: 20,
          padding: "18px 22px",
          background: "#FAFAFA",
          borderRadius: 12,
          fontFamily: "Montserrat, sans-serif",
          fontSize: 13,
          color: "#333",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Criteria (1–5)</span>
            <span style={{ fontWeight: 600 }}>{criteriaTotal} / 25</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>Office Hours</span>
            <span style={{ fontWeight: 600, color: officeHoursPoints < 0 ? "#C0392B" : "#000" }}>
              {officeHoursPoints > 0 ? `+${officeHoursPoints}` : officeHoursPoints}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>Presentation</span>
            <span style={{ fontWeight: 600 }}>
              {presentationPoints > 0 ? `+${presentationPoints}` : presentationPoints}
            </span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid #E5E5E5",
            fontSize: 15,
            fontWeight: 700,
            color: "#000",
          }}>
            <span>Final Score</span>
            <span>{totalScore} / {maxScore}</span>
          </div>
        </div>

        {/* Feedback */}
        <div style={{ marginTop: 24 }}>
          <label style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 1,
            color: "#000",
            display: "block",
            marginBottom: 6,
          }}>
            YOUR FEEDBACK
          </label>
          <p style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 12,
            color: "#888",
            margin: "0 0 10px 0",
          }}>
            Coach inputs their feedback here.
          </p>
          <textarea
            placeholder="Input Your Feedback Here"
            value={grades.feedback}
            onChange={(e) => setGrades(prev => ({ ...prev, feedback: e.target.value }))}
            rows="4"
            style={{
              width: "100%",
              padding: 14,
              border: "1px solid #DDD",
              borderRadius: 10,
              fontFamily: "Montserrat, sans-serif",
              fontSize: 14,
              resize: "vertical",
              color: "#000",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 24,
            width: "100%",
            padding: 18,
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "Montserrat, sans-serif",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Submit Grade"}
        </button>
      </form>

      {/* Previous / Next navigation */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 24,
        marginBottom: 24,
      }}>
        <button
          onClick={() => navigate("/coach/grading")}
          style={{
            padding: "12px 28px",
            background: "transparent",
            border: "1px solid #000",
            borderRadius: 100,
            cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ← Previous
        </button>
        <button
          onClick={() => navigate("/coach/grading")}
          style={{
            padding: "12px 28px",
            background: "transparent",
            border: "1px solid #000",
            borderRadius: 100,
            cursor: "pointer",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </CoachLayout>
  );
}