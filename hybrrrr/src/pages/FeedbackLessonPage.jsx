import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/image-lesson.css";
import "../styles/info-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import infoImg from "../assets/images/lesson-girl.jpg";

const ClockIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4FC2F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const SurveyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);
const ExternalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

export default function FeedbackLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(null); // null | true | false
  const progress = 25;

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  const title = content?.title || lesson?.title || "Program Feedback";
  const subtitle = content?.subtitle || "A brief summarising statement.";
  const duration = content?.duration || lesson?.duration || "5 MIN";
  const headerText = content?.header || "Header, Lorem Ipsum Dolor Sit Amet";
  const bodyText = content?.body_text || "Lorem ipsum dolor sit amet.";
  const bodyText2 = content?.body_text_2 || "";
  const imageUrl = getMediaUrl(content?.image_url) || infoImg;
  const imageCaption = content?.image_caption || "IMAGE DESCRIPTION, LOCATION, AND MORE - AS REQUIRED";
  const objectives = content?.objectives_json || ["Lorem ipsum dolor sit amet.", "Donec eu urna vel lorem ornare pretium."];
  const references = content?.references_json || [{ title: "https://hybrgroup.net/", url: "https://hybrgroup.net/" }];
  const resources = content?.resources_json || ['"Lorem ipsum", by Consectetur Adipiscing.'];

  // ✅ Survey URL comes from curriculum
  const surveyUrl = content?.survey_url || lesson?.surveyUrl || null;
  const hasSurvey = !!surveyUrl;

  // Handle next with survey answer
  const handleNextClick = () => {
    if (hasSurvey && surveyCompleted === null) {
      alert("Please let us know if you've completed the survey before moving on.");
      return;
    }
    // Pass survey answer up to LessonRouter
    if (onNext) onNext({ surveyCompleted });
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
            <span className="topbar-subtitle">FEEDBACK</span>
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
              <div className="module-overview-card">
                <h2 className="info-heading">{headerText}</h2>
                <p className="info-body" style={{ whiteSpace: "pre-line" }}>{bodyText}</p>
                <div className="info-image-wrap">
                  <img src={imageUrl} alt="" className="info-image" />
                  <div className="info-image-caption">{imageCaption}</div>
                </div>
                {bodyText2 && <p className="info-body" style={{ whiteSpace: "pre-line" }}>{bodyText2}</p>}

                {/* ── SURVEY CONFIRMATION CARD (only if surveyUrl set) ── */}
                {hasSurvey && (
                  <div style={{
                    marginTop: 32,
                    padding: "24px 28px",
                    background: "linear-gradient(135deg, #f0f9e8 0%, #fff 100%)",
                    border: "2px solid #8DC540",
                    borderRadius: 16,
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 14,
                    }}>
                      <SurveyIcon />
                      <h3 style={{
                        fontFamily: "Raleway, sans-serif",
                        fontSize: 18,
                        fontWeight: 700,
                        margin: 0,
                        color: "#000",
                      }}>
                        Have you completed the survey?
                      </h3>
                    </div>
                    <p style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 13,
                      color: "#555",
                      margin: "0 0 18px 0",
                      lineHeight: 1.5,
                    }}>
                      Make sure to click the survey link in the <strong>References</strong> panel and complete it. 
                      You'll earn <strong style={{ color: "#5a8a1a" }}>+3 bonus points</strong> if you've completed it!
                    </p>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setSurveyCompleted(true)}
                        style={{
                          flex: 1,
                          padding: "12px 20px",
                          border: surveyCompleted === true ? "2px solid #8DC540" : "1px solid #DDD",
                          background: surveyCompleted === true ? "#8DC540" : "#fff",
                          color: surveyCompleted === true ? "#fff" : "#666",
                          borderRadius: 10,
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        ✅ Yes, I completed it (+3 pts)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSurveyCompleted(false)}
                        style={{
                          flex: 1,
                          padding: "12px 20px",
                          border: surveyCompleted === false ? "2px solid #C0392B" : "1px solid #DDD",
                          background: surveyCompleted === false ? "#C0392B" : "#fff",
                          color: surveyCompleted === false ? "#fff" : "#666",
                          borderRadius: 10,
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        Not yet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="module-right">
              <div className="module-card">
                <h3 className="module-card-title">Objectives</h3>
                <ul className="module-card-list">{objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              </div>

              {/* ── REFERENCES (with optional SURVEY LINK at top) ── */}
              <div className="module-card">
                <h3 className="module-card-title">References</h3>
                <div className="references-list">
                  {/* ✅ Survey link appears FIRST and styled distinctly */}
                  {hasSurvey && (
                    <a
                      href={surveyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: "linear-gradient(135deg, #8DC540, #648C2D)",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: 10,
                        marginBottom: 10,
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "transform 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <SurveyIcon />
                      <span style={{ flex: 1 }}>📋 Take the Survey</span>
                      <ExternalIcon />
                    </a>
                  )}

                  {/* Other references */}
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
          <button
            className="module-nav-btn module-nav-next"
            onClick={handleNextClick}
          >
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