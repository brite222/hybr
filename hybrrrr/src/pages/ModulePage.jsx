import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import handImg from "../assets/images/hand.png";
import alphaLogo from "../assets/images/alpha-loggo.png";
import { awardPoints } from "../utils/awardPoints";

const PencilIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const VideoIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M22 8l-6 4 6 4V8z" /></svg>);
const SlidesIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>);
const AudioIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>);
const UploadIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>);
const DownloadIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>);
const FeedbackIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const InfoIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>);
const ImageIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

// ✅ Map lesson types to icons
const getIconForType = (type) => {
  switch (type) {
    case "video": return <VideoIcon />;
    case "audio": return <AudioIcon />;
    case "download": return <DownloadIcon />;
    case "quiz": return <PencilIcon />;
    case "upload": return <UploadIcon />;
    case "image": return <ImageIcon />;
    case "info": return <InfoIcon />;
    case "feedback": return <FeedbackIcon />;
    default: return <SlidesIcon />;
  }
};

export default function ModulePage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
  progress = 0,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  // ✅ Clean fallbacks — all content managed via Admin Editor
  const title = content?.title || lesson?.title || "";
  const imageUrl = getMediaUrl(content?.image_url) || handImg;
  const bodyText = content?.body_text || "";
  const bodyText2 = content?.body_text_2 || "";
  const programTrack = content?.program_track || "";
  const objectives = content?.objectives_json || [];

  // ✅ Get real lesson list (exclude the "module" overview itself)
  const weekData = CURRICULUM[week];
  const contentLessons = weekData?.lessons.filter(l => l.type !== "module") || [];

  const handleNext = async () => {
    try {
      await awardPoints({ lessonId: lesson?.id, weekNumber: week, lessonType: "module" });
    } catch (err) {
      console.error(err);
    }
    if (onNext) onNext();
    else navigate("/courses/overview");
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
            <span className="topbar-subtitle">OVERVIEW</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar"><div className="module-progress-fill" style={{ width: `${progress}%` }} /></div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>) : (
          <div className="module-content">
            <div className="module-left">
              <div className="module-image-wrap">
                <img src={imageUrl} alt="" className="module-image" />
              </div>
              <div className="module-overview-card">
                {title && <h2 className="module-heading">{title}</h2>}
                {bodyText && (
                  <p className="module-body" style={{ whiteSpace: "pre-line" }}>
                    {bodyText}
                  </p>
                )}
                {programTrack && (
                  <div className="module-program-label">{programTrack}</div>
                )}
                {bodyText2 && (
                  <p className="module-body" style={{ whiteSpace: "pre-line" }}>
                    {bodyText2}
                  </p>
                )}
              </div>
            </div>
            <aside className="module-right">
              {objectives.length > 0 && (
                <div className="module-card">
                  <h3 className="module-card-title">Objectives</h3>
                  <ul className="module-card-list">
                    {objectives.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}
              <div className="module-card">
                <h3 className="module-card-title">Module Content</h3>
                <div className="module-content-list">
                  {contentLessons.map((l) => (
                    <div key={l.id} className="module-content-item">
                      {getIconForType(l.type)}
                      <span>{l.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
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
          <button className="module-nav-btn module-nav-next" onClick={handleNext}>
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