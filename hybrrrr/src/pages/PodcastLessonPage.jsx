import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";   // ✅ NEW
import "../styles/module.css";
import "../styles/podcast-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import podcastThumb from "../assets/images/podcast-thumb.jpg";

// Icons (kept — used in page body)
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const PlayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PauseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="5" width="4" height="14" />
    <rect x="14" y="5" width="4" height="14" />
  </svg>
);
const WaveformIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="10" x2="4" y2="14" />
    <line x1="8" y1="6" x2="8" y2="18" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="16" y1="4" x2="16" y2="20" />
    <line x1="20" y1="11" x2="20" y2="13" />
  </svg>
);
const ChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function PodcastLessonPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(52);
  const totalTime = 337;
  const progress = 25;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.max(0, Math.min(totalTime, percent * totalTime)));
  };

  const playPercent = (currentTime / totalTime) * 100;

  return (
    <div className="module-page">
      {/* Mobile top header */}
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">ALPHA</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />

      {/* ── SHARED SIDEBAR ── */}
      <StudentSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="module-main">
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">MODULE 1</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">LESSON 1 OF 4</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar">
              <div className="module-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        <div className="lesson-banner">
          <img src={lessonBannerBg} alt="" className="lesson-banner-bg" />
          <div className="lesson-banner-content">
            <h1 className="lesson-banner-title">
              Title of Lesson, Lorem Ipsum Dolor Sit Amet.
            </h1>
            <p className="lesson-banner-subtitle">
              A brief summarising statement about what this lesson covers.
            </p>
            <div className="lesson-banner-duration">
              <ClockIcon />
              <span>6 MINUTES</span>
            </div>
          </div>
        </div>

        <div className="module-content">
          <div className="module-left">
            <div className="podcast-thumb-wrap">
              <img src={podcastThumb} alt="" className="podcast-thumb" />
            </div>

            <div className="audio-player">
              <button
                className="audio-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>

              <span className="audio-time audio-time-current">{formatTime(currentTime)}</span>

              <div className="audio-progress" onClick={handleSeek}>
                <div className="audio-progress-bar">
                  <div className="audio-progress-fill" style={{ width: `${playPercent}%` }} />
                  <div className="audio-progress-thumb" style={{ left: `${playPercent}%` }} />
                </div>
              </div>

              <span className="audio-time audio-time-total">{formatTime(totalTime)}</span>

              <button className="audio-waveform-btn" aria-label="Waveform">
                <WaveformIcon />
              </button>
            </div>

            <div className="module-overview-card">
              <h2 className="module-heading">
                Title of Audio Lesson, Lorem Ipsum Dolor
              </h2>
              <p className="module-body">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Vestibulum aliquam tellus sit amet eros maximus gravida.
                Vestibulum sit amet nisl libero.
              </p>
              <div className="module-program-label">PROGRAM TRACK/THEME</div>
            </div>
          </div>

          <aside className="module-right">
            <div className="transcript-card">
              <h3 className="transcript-title">Transcript:</h3>
              <div className="transcript-body">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                <p>Donec eu urna vel lorem ornare pretium.</p>
                <p>Integer interdum imperdiet risus, bibendum hendrerit nunc imperdiet eleifend.</p>
              </div>
              <button className="transcript-expand" aria-label="Expand transcript">
                <ChevronDown />
              </button>
            </div>
          </aside>
        </div>

        <div className="module-nav-buttons">
          <button
            className="module-nav-btn module-nav-prev"
            onClick={() => navigate("/image-lesson")}
          >
            <ArrowLeft />
            <span>Previous</span>
          </button>
          <button
            className="module-nav-btn module-nav-next"
            onClick={() => navigate("/dashboard")}
          >
            <span>Next</span>
            <ArrowRight />
          </button>
        </div>
      </main>
    </div>
  );
}