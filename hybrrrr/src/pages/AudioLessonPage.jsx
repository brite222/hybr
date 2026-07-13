import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContent, getMediaUrl } from "../hooks/useContent";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/podcast-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import podcastThumb from "../assets/images/podcast-thumb.jpg";
import { awardPoints } from "../utils/awardPoints";
import alphaLogo from "../assets/images/alpha-loggo.png";
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const PlayIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>);
const PauseIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>);
const WaveformIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="10" x2="4" y2="14" /><line x1="8" y1="6" x2="8" y2="18" /><line x1="12" y1="9" x2="12" y2="15" /><line x1="16" y1="4" x2="16" y2="20" /><line x1="20" y1="11" x2="20" y2="13" />
  </svg>
);
const ChevronDown = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

function showAudioCompleteToast(points) {
  const toast = document.createElement("div");
  toast.innerHTML = `🎧 Audio complete!<br/>+${points} points earned`;
  toast.style.cssText = `position: fixed; top: 24px; right: 24px; background: linear-gradient(135deg, #8DC540, #648C2D); color: white; padding: 18px 28px; border-radius: 12px; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 8px 24px rgba(141, 197, 64, 0.4); z-index: 9999;`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

export default function AudioLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
  progress = 0,
}) {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioCompleted, setAudioCompleted] = useState(false);
 

  const week = weekNumber || 1;
  const { content, loading } = useContent(week, lesson?.id);

  const title = content?.title || lesson?.title || "Title of Audio Lesson";
  const subtitle = content?.subtitle || "A brief summarising statement about what this lesson covers.";
  const lessonDuration = content?.duration || lesson?.duration || "6 MIN";
  const audioSrc = getMediaUrl(content?.audio_url) || "/audio/lesson-audio.mp3";
  const thumbnailUrl = getMediaUrl(content?.image_url) || podcastThumb;
  const headerText = content?.header || "";
  const bodyText = content?.body_text || "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const programTrack = content?.program_track || "PROGRAM TRACK/THEME";
  const transcript = content?.transcript_json || [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Donec eu urna vel lorem ornare pretium.",
    "Integer interdum imperdiet risus, bibendum hendrerit nunc imperdiet eleifend.",
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = async () => {
      setIsPlaying(false);
      if (audioCompleted) return;
      setAudioCompleted(true);
      try {
        const result = await awardPoints({ lessonId: lesson?.id, weekNumber: week, lessonType: "audio" });
        if (result?.pointsEarned) showAudioCompleteToast(result.pointsEarned);
      } catch (err) { console.error(err); }
    };
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioSrc, audioCompleted, lesson?.id, week]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause(); else audio.play();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (sec) => {
    if (isNaN(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
    setCurrentTime(audio.currentTime);
  };

  const playPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
            <span className="topbar-subtitle">AUDIO LESSON</span>
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
            <div className="lesson-banner-duration"><ClockIcon /><span>{lessonDuration}</span></div>
          </div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading...</div>) : (
          <div className="module-content">
            <div className="module-left">
              <div className="podcast-thumb-wrap"><img src={thumbnailUrl} alt="" className="podcast-thumb" /></div>
              <audio ref={audioRef} preload="metadata" key={audioSrc}><source src={audioSrc} type="audio/mpeg" /></audio>
              <div className="audio-player">
                <button className="audio-play-btn" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <span className="audio-time audio-time-current">{formatTime(currentTime)}</span>
                <div className="audio-progress" onClick={handleSeek}>
                  <div className="audio-progress-bar">
                    <div className="audio-progress-fill" style={{ width: `${playPercent}%` }} />
                    <div className="audio-progress-thumb" style={{ left: `${playPercent}%` }} />
                  </div>
                </div>
                <span className="audio-time audio-time-total">{formatTime(duration)}</span>
                <button className="audio-waveform-btn"><WaveformIcon /></button>
              </div>
              <div className="module-overview-card">
                <h2 className="module-heading">{title}</h2>
                <p className="module-body">{bodyText}</p>
                {headerText && <h3 style={{ marginTop: 20, fontFamily: "Raleway", fontSize: 20 }}>{headerText}</h3>}
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

        {/* ── NAV BUTTONS ── */}
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