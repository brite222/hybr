import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../hooks/useContent";
import { awardPoints } from "../utils/awardPoints";
import api from "../api/axios";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/image-lesson.css";
import "../styles/upload-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import alphaLogo from "../assets/images/alpha-loggo.png";

const ClockIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

export default function UploadLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const progress = 25;

  const week = weekNumber || 1;
  const lessonId = lesson?.id || "workplan";
  const { content, loading } = useContent(week, lessonId);

  const title = content?.title || lesson?.title || "Title of Upload Lesson";
  const subtitle = content?.subtitle || "Submit your completed assignment below.";
  const duration = content?.duration || lesson?.duration || "30 MIN";
  const headerText = content?.header || "Header, Lorem Ipsum Dolor Sit Amet";
  const bodyText = content?.body_text || "Upload your filled work assignment as a PDF (max 10MB).";

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") { setError("Only PDF files allowed"); return; }
    if (selected.size > 10 * 1024 * 1024) { setError("File too large (max 10MB)"); return; }
    setFile(selected); setError(""); setSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a file first"); return; }
    setUploading(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("weekNumber", week);
      formData.append("lessonId", lessonId);
      await api.post("/submissions", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(true); setFile(null);
      try { await awardPoints({ lessonId, weekNumber: week, lessonType: "upload" }); }
      catch (err) { console.error(err); }
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally { setUploading(false); }
  };

  return (
    <div className="module-page">
      <div className="mobile-top-header">
       <div className="mobile-top-header-logo">
  <img src={alphaLogo} alt="ALPHA by HYBR" className="mobile-top-header-logo-img" />
</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu"><HamburgerIcon /></button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {week}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">UPLOAD</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar"><div className="module-progress-fill" style={{ width: `${progress}%` }} /></div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        <div className="lesson-banner">
          <img src={lessonBannerBg} alt="" className="lesson-banner-bg" />
          <div className="lesson-banner-content">
            <h1 className="lesson-banner-title">{title}</h1>
            <p className="lesson-banner-subtitle">{subtitle}</p>
            <div className="lesson-banner-duration"><ClockIcon /><span>{duration}</span></div>
          </div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>) : (
          <div className="upload-card">
            <h2 className="upload-heading">{headerText}</h2>
            <p className="upload-body" style={{ whiteSpace: "pre-line" }}>{bodyText}</p>
            {error && <div className="upload-alert error">{error}</div>}
            {success && <div className="upload-alert success">✅ File uploaded successfully!</div>}
            <label className="upload-dropzone">
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
              <UploadIcon />
              <div className="upload-dropzone-text">
                {file ? (
                  <><strong>{file.name}</strong><br /><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></>
                ) : (
                  <><strong>Click to choose a PDF</strong><br /><small>Max 10MB, PDF only</small></>
                )}
              </div>
            </label>
            <button className="upload-btn" onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Submit Assignment"}
            </button>
          </div>
        )}

        <div className="module-nav-buttons">
  <button className="module-nav-btn module-nav-prev" onClick={onPrev || (() => navigate("/courses/overview"))}>
    <ArrowLeft />
    <span className="nav-btn-text">
      {hasPrev ? "Previous" : "Back to Course"}
      {hasPrev && prevLessonTitle && (
        <span className="nav-btn-detail">: {prevLessonTitle}</span>
      )}
    </span>
  </button>
  <button className="module-nav-btn module-nav-next" onClick={onNext || (() => navigate("/courses/overview"))}>
    <span className="nav-btn-text">
      {hasNext ? "Next" : "Back to Course"}
      {hasNext && nextLessonTitle && (
        <span className="nav-btn-detail">: {nextLessonTitle}</span>
      )}
    </span>
    <ArrowRight />
  </button>
</div>
      </main>
    </div>
  );
}