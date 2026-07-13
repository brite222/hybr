import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import { awardPoints } from "../utils/awardPoints";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/image-lesson.css";
import "../styles/download-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";

const ClockIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

export default function DownloadLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progress = 25;

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  // ✅ Clean fallbacks — content managed via Admin Editor
  const title = content?.title || lesson?.title || "";
  const subtitle = content?.subtitle || "";
  const duration = content?.duration || lesson?.duration || "";
  const headerText = content?.header || "";
  const bodyText = content?.body_text || "";
  const pdfUrl = getMediaUrl(content?.pdf_url) || "/files/booklet.pdf";

  const downloadableUrl = pdfUrl.includes('/upload/')
    ? pdfUrl.replace('/upload/', '/upload/fl_attachment/')
    : pdfUrl;

  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = downloadableUrl;
    link.download = `ALPHA-Week${week}-${lesson?.id || "Booklet"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    try {
      await awardPoints({ lessonId: lesson?.id || "download", weekNumber: week, lessonType: "download" });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="module-page">
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">ALPHA</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu"><HamburgerIcon /></button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {week}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">DOWNLOAD GUIDE</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar"><div className="module-progress-fill" style={{ width: `${progress}%` }} /></div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        <div className="lesson-banner">
          <img src={lessonBannerBg} alt="" className="lesson-banner-bg" />
          <div className="lesson-banner-content">
            {title && <h1 className="lesson-banner-title">{title}</h1>}
            {subtitle && <p className="lesson-banner-subtitle">{subtitle}</p>}
            {duration && (
              <div className="lesson-banner-duration"><ClockIcon /><span>{duration}</span></div>
            )}
          </div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>) : (
          <div className="download-card">
            {headerText && <h2 className="download-heading">{headerText}</h2>}
            {bodyText && (
              <p className="download-body" style={{ whiteSpace: "pre-line" }}>{bodyText}</p>
            )}
            <button className="download-btn" onClick={handleDownload}>
              <DownloadIcon /><span>Download Booklet</span>
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