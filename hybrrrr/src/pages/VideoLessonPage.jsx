import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import { awardPoints } from "../utils/awardPoints";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/video-lesson.css";

const ChevronDown = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);
const PlayBigIcon = () => (<svg width="80" height="80" viewBox="0 0 80 80" fill="white"><path d="M28 20 L60 40 L28 60 Z" /></svg>);
const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
);

function showVideoCompleteToast(points) {
  const toast = document.createElement("div");
  toast.innerHTML = `🎬 Video complete!<br/>+${points} points earned`;
  toast.style.cssText = `position: fixed; top: 24px; right: 24px; background: linear-gradient(135deg, #8DC540, #648C2D); color: white; padding: 18px 28px; border-radius: 12px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 8px 24px rgba(141, 197, 64, 0.4); z-index: 9999;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

export default function VideoLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = 25;

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  const title = content?.title || lesson?.title || "Title of Video Lesson, Lorem Ipsum Dolor";
  const videoSrc = getMediaUrl(content?.video_url) || "/videos/lesson-video.mp4";
  const headerText = content?.header || "";
  const bodyText = content?.body_text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const programTrack = content?.program_track || "PROGRAM TRACK/THEME";
  const transcript = content?.transcript_json || [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Donec eu urna vel lorem ornare pretium.",
    "Integer interdum imperdiet risus, bibendum hendrerit nunc imperdiet eleifend.",
  ];

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    if (videoCompleted) return;
    setVideoCompleted(true);
    try {
      const result = await awardPoints({ lessonId: lesson?.id, weekNumber: week, lessonType: "video" });
      if (result?.pointsEarned) showVideoCompleteToast(result.pointsEarned);
    } catch (err) { console.error(err); }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setIsPlaying(true); }
    else { video.pause(); setIsPlaying(false); }
  };

  const goFullscreen = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
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
            <span className="topbar-subtitle">VIDEO LESSON</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar"><div className="module-progress-fill" style={{ width: `${progress}%` }} /></div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading lesson content...</div>) : (
          <div className="module-content">
            <div className="module-left">
              <div className="video-player-wrap" onClick={togglePlay}>
                <video ref={videoRef} className="video-player" preload="metadata" key={videoSrc} playsInline
                  onContextMenu={(e) => e.preventDefault()}
                  onEnded={handleVideoEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}>
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {!isPlaying && <button className="video-play-overlay" aria-label="Play"><PlayBigIcon /></button>}
                <button className="video-fullscreen-btn" onClick={goFullscreen} aria-label="Fullscreen"><FullscreenIcon /></button>
              </div>
              <div className="module-overview-card">
                <h2 className="module-heading">{title}</h2>
                <p className="module-body">{bodyText}</p>
                {headerText && <h3 style={{ marginTop: 24, fontFamily: "Raleway", fontSize: 20 }}>{headerText}</h3>}
                <div className="module-program-label">{programTrack}</div>
              </div>
            </div>
            <aside className="module-right">
              <div className="transcript-card">
                <h3 className="transcript-title">Transcript:</h3>
                <div className="transcript-body">{transcript.map((p, i) => <p key={i}>{p}</p>)}</div>
                <button className="transcript-expand"><ChevronDown /></button>
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