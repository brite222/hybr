import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/image-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import lessonImg from "../assets/images/lesson-girl.jpg";
import { awardPoints } from "../utils/awardPoints";

const ClockIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC2F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

export default function ImageLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progress = 25;

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  const title = content?.title || lesson?.title || "Title of Lesson";
  const subtitle = content?.subtitle || "A brief summarising statement.";
  const duration = content?.duration || lesson?.duration || "7 MIN";
  const imageUrl = getMediaUrl(content?.image_url) || lessonImg;
  const headerText = content?.header || "Header, Lorem Ipsum Dolor Sit Amet";
  const bodyText = content?.body_text || "Lorem ipsum dolor sit amet.";
  const bodyText2 = content?.body_text_2 || "";
  const objectives = content?.objectives_json || ["Lorem ipsum dolor sit amet.", "Donec eu urna vel lorem ornare pretium.", "Integer interdum imperdiet risus."];
  const references = content?.references_json || [{ title: "https://hybrgroup.net/", url: "https://hybrgroup.net/" }];
  const resources = content?.resources_json || ['"Lorem ipsum", by Consectetur Adipiscing.'];

  const handleNext = async () => {
    try {
      await awardPoints({ lessonId: lesson?.id, weekNumber: week, lessonType: "image" });
    } catch (err) {
      console.error(err);
    }
    if (onNext) onNext();
    else navigate("/courses/overview");
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
            <span className="topbar-subtitle">IMAGE LESSON</span>
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
          <div className="module-content">
            <div className="module-left">
              <div className="lesson-image-wrap"><img src={imageUrl} alt="" className="lesson-image" /></div>
              <div className="module-overview-card">
                <h2 className="module-heading">{headerText}</h2>
                <p className="module-body" style={{ whiteSpace: "pre-line" }}>{bodyText}</p>
                {bodyText2 && <p className="module-body" style={{ whiteSpace: "pre-line" }}>{bodyText2}</p>}
              </div>
            </div>
            <aside className="module-right">
              <div className="module-card">
                <h3 className="module-card-title">Objectives</h3>
                <ul className="module-card-list">{objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              </div>
              <div className="module-card">
                <h3 className="module-card-title">References</h3>
                <div className="references-list">
                  {references.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="reference-item">
                      <LinkIcon /><span>{r.title || r.url}</span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="module-card">
                <h3 className="module-card-title">Further Resources</h3>
                <ul className="resources-list">
                  {resources.map((r, i) => (
                    <li key={i}>
                      {r.startsWith && r.startsWith("http") ? (
                        <a href={r} target="_blank" rel="noopener noreferrer" className="resource-link">{r}</a>
                      ) : (<span>{r}</span>)}
                    </li>
                  ))}
                </ul>
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