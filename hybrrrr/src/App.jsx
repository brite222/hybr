import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import DashboardPage from "./pages/DashboardPage";
import ModulePage from "./pages/ModulePage";
import VideoLessonPage from "./pages/VideoLessonPage";
import ImageLessonPage from "./pages/ImageLessonPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAssignments from "./pages/admin/AdminAssignments";
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachStudents from "./pages/coach/CoachStudents";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import DownloadLessonPage from "./pages/DownloadLessonPage";
import UploadLessonPage from "./pages/UploadLessonPage";
import AudioLessonPage from "./pages/AudioLessonPage";
import QuizLessonPage from "./pages/QuizLessonPage";
import InfoLessonPage from "./pages/InfoLessonPage";
import WeekPage from "./pages/WeekPage";
import LessonRouter from "./pages/LessonRouter";
import CoachStudentDetail from "./pages/coach/CoachStudentDetail";
import CoachGrading from "./pages/coach/CoachGrading";
import CoachGradeStudent from "./pages/coach/CoachGradeStudent";
import StudentGrades from "./pages/StudentGrades";
import AdminContent from "./pages/admin/AdminContent";
import AdminContentEditor from "./pages/admin/AdminContentEditor";
import StudentAchievements from "./pages/StudentAchievements";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import StudentGradeDetail from "./pages/StudentGradeDetail";
import ProfilePage from "./pages/ProfilePage";
import "./styles/base.css";
import "./styles/spacing-corrections.css";
import "./styles/desktop.css";
import "./styles/tablet-horizontal.css";
import "./styles/tablet-vertical.css";
import "./styles/mobile.css";
import ResourcesPage from "./pages/ResourcesPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import CourseOverviewPage from "./pages/CourseOverviewPage";
import AdminCohorts from "./pages/admin/AdminCohorts";
import AdminClasses from "./pages/admin/AdminClasses";


// ── Images ───────────────────────────────────────────────────────────────────
import alphaLogo from "./assets/images/alpha-loggo.png";
import heroImg from "./assets/images/hero.jpg";
import aboutImg from "./assets/images/about.jpg";
import videoThumb from "./assets/images/video-thumb.jpg";
import syllabusImg from "./assets/images/syllabus.jpg";
import phasesImg from "./assets/images/phases.jpg";
import testimonial1 from "./assets/images/testimonial-1.jpg";
import hybrMarkColor from "./assets/logos/hybr-mark-color.png";
import hybrMarkBlack from "./assets/logos/hybr-mark-black.png";

// ── Decor assets ─────────────────────────────────────────────────────────────
import wireframeTr from "./assets/decor/wireframe-tr.png";
import wireframeBl from "./assets/decor/wireframe-bl.png";
import arrowWhite from "./assets/decor/arrow-white.png";
import arrowBlue from "./assets/decor/arrow-blue.png";
import arrowGreen from "./assets/decor/arrow-green.png";

// ── Icons (PNG from prototype) ───────────────────────────────────────────────
import calendarIcon from "./assets/icons/calendar.png";
import groupIcon from "./assets/icons/group.png";
import globeIcon from "./assets/icons/globe.png";
import clockPersonIcon from "./assets/icons/clock-person.png";
import buildingsIcon from "./assets/icons/buildings.png";
import robotIcon from "./assets/icons/robot.png";
import shapesIcon from "./assets/icons/shapes.png";
import cometIcon from "./assets/icons/comet.png";
import routeIcon from "./assets/icons/route.png";
import searchIcon from "./assets/icons/search.png";
import brainIcon from "./assets/icons/brain.png";
import wandIcon from "./assets/icons/wand.png";
import routeBlueIcon from "./assets/icons/route-blue.png";
import searchBlueIcon from "./assets/icons/search-blue.png";
import brainBlueIcon from "./assets/icons/brain-blue.png";
import wandBlueIcon from "./assets/icons/wand-blue.png";

// ── Social Icons (kept inline) ───────────────────────────────────────────────
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h4v16H4zM6 2a2 2 0 110 4 2 2 0 010-4zM10 8h4v2c.6-1 2-2 4-2 3 0 4 2 4 5v7h-4v-6c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5V20h-4z" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 3h3l-7 8 8 10h-6l-5-6-5 6H3l7-9L3 3h6l4 5z" />
  </svg>
);
const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 8s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16 4.7 12 4.7 12 4.7s-4 0-7.2.3c-.4.1-1.2.1-2 .9C2.2 6.5 2 8 2 8s-.2 1.7-.2 3.5v1.7c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.2 7 .3 7 .3s4 0 7.2-.3c.4-.1 1.2-.1 2-.9.6-.6.7-2.1.7-2.1s.2-1.7.2-3.5v-1.7C22.2 9.7 22 8 22 8zM10 15V9l5 3-5 3z" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <path d="M14 8h-2c-1 0-1 1-1 1v2H9v3h2v6h3v-6h2l1-3h-3V9.5c0-.5.5-.5.5-.5H14z" fill="currentColor" stroke="none" />
  </svg>
);
const MediumIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6" cy="12" r="5" />
    <ellipse cx="15" cy="12" rx="2" ry="5" />
    <ellipse cx="20" cy="12" rx="1" ry="4.5" />
  </svg>
);
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 3v3a4 4 0 004 4v3a7 7 0 01-4-1.3V16a5 5 0 11-5-5v3a2 2 0 102 2V3h3z" />
  </svg>
);

// ── HYBR Logo Lockup ─────────────────────────────────────────────────────────
const HybrLogo = ({ variant = "white", size = "nav" }) => {
  const isWhite = variant === "white";
  return (
    <span className={`hybr-lockup hybr-lockup-${size}`}>
      <img
        src={hybrMarkBlack}
        alt=""
        className={`hybr-mark ${isWhite ? "hybr-mark-white" : ""}`}
      />
      <span className="hybr-word" style={{ color: isWhite ? "#fff" : "#000" }}>
        HYBR
      </span>
    </span>
  );
};

// ── Data ─────────────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "Testimonial #1 to be provided by Oluwatobi Agbana.",
    name: "FirstName LastName",
    meta: "Role  |  2024/2025 ALPHA Program",
    image: testimonial1,
  },
  {
    quote: "Testimonial #2 to be provided by Oluwatobi Agbana.",
    name: "FirstName LastName",
    meta: "Role  |  2024/2025 ALPHA Program",
    image: null,
  },
  {
    quote: "Testimonial #3 to be provided by Oluwatobi Agbana.",
    name: "FirstName LastName",
    meta: "Role  |  2024/2025 ALPHA Program",
    image: null,
  },
];

// ── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();
  const [tIdx, setTIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Auto-slide testimonials every 5 seconds ──
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const t = testimonials[tIdx];

  return (
    <>
      {/* ── HERO with nav INSIDE ── */}
      <section id="hero">
        <nav className={scrolled ? "nav-scrolled" : ""}>
          <div className="nav-logo">
            <img src={alphaLogo} alt="ALPHA by HYBR" className="nav-alpha-logo" />
          </div>
          <div className="nav-links">
            <a onClick={() => scrollTo("about")}>About the Program</a>
            <a onClick={() => scrollTo("curriculum")}>The Roadmap</a>
            <a onClick={() => scrollTo("testimonials")}>Testimonials</a>
          </div>
          <button className="btn-login" onClick={() => navigate("/login")}>Log In</button>
          <button className="nav-hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        <div className="hero-content animate-fadeUp">
          <h1>
           Gain Real-World Innovation
            <br />
            Experience
          </h1>
          <p>
            Welcome to an 8-week virtual innovation journey where students work like young
            innovators: exploring real-world problems, discovering insights, building solutions,
            creating prototypes, and presenting ideas with confidence. If you're already
            registered, log in to start your journey.
          </p>
          <p className="hero-byline">Curated by HYBR in partnership with 7Edu.</p>
          <button className="btn-outline btn-with-arrow" onClick={() => scrollTo("curriculum")}>
            View The Roadmap
            <span className="btn-arrow">→</span>
          </button>
        </div>

        <div className="hero-bg-blob">
          <img src={heroImg} alt="" className="blob-img" />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about">
        <div>
          <div className="section-label">About the Program</div>
          <h2>You Bring the Curiosity. We Bring the Blueprint.</h2>
          <p>
            ALPHA is an 8-week virtual industry shadowing experience for high school students
            looking to gain real-world skills in innovation, problem-solving, and leadership.
            Students work in teams to tackle global challenges, build prototypes, and present
            their ideas on Demo Day.
          </p>
          <button className="btn-outline btn-with-arrow" onClick={() => navigate("/login")}>
            Log In to Start Your Journey
            <span className="btn-arrow">→</span>
          </button>
        </div>
        <div className="about-image">
          <img src={aboutImg} alt="" className="about-img" />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features">
        <div className="section-label">
          About the Program: <span className="blue">Program Features</span>
        </div>
        <h2>
          HYBR and 7Edu will guide you through a clear, practical, and exciting innovation journey.
        </h2>

        {/* Row 1: Card 1 + Card 2 */}
        <div className="feature-grid">
          {[
            {
              icon: calendarIcon,
              label: "Program Duration",
              value: "8 Weeks",
              back: "Innovation training designed for students, with weekly missions that show you what to focus on.",
            },
            {
              icon: groupIcon,
              label: "Program Structure",
              value: "1-5 Person Groups",
              back: "1-5 person groups, with team collaboration through Slack and Google Workspace. Research, build, test, and present with practical tools.",
            },
          ].map((f, i) => {
            const id = `feat-row1-${i}`;
            return (
              <div
                key={id}
                className={`feature-card-wrapper ${flippedCards[id] ? "flipped" : ""}`}
                onClick={() => toggleFlip(id)}
              >
                <div className="feature-card feature-card-front">
                  <img src={f.icon} alt="" className="card-icon-img" />
                  <div className="card-label">{f.label}</div>
                  <div className="card-value">{f.value}</div>
                  <div className="card-info">i</div>
                </div>
                <div className="feature-card feature-card-back">
                  <p className="feature-back-text">{f.back}</p>
                  <div className="back-bottom">
                    <img src={f.icon} alt="" className="back-icon" />
                    <span className="back-value">{f.value.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: Card 3 + Card 4 */}
        <div className="feature-grid-row2">
          {[
            {
              icon: globeIcon,
              label: "Program Model",
              value: "100% Virtual",
              back: "Custom LMS with tailored resource materials and 1:1 office hours with skilled coaches. Completely Virtual.",
            },
            {
              icon: clockPersonIcon,
              label: "Project Presentation",
              value: "Demo Day",
              back: "A final showcase where you present what you created.",
            },
          ].map((f, i) => {
            const id = `feat-row2-${i}`;
            return (
              <div
                key={id}
                className={`feature-card-wrapper ${flippedCards[id] ? "flipped" : ""}`}
                onClick={() => toggleFlip(id)}
              >
                <div className="feature-card feature-card-front">
                  <img src={f.icon} alt="" className="card-icon-img" />
                  <div className="card-label">{f.label}</div>
                  <div className="card-value">{f.value}</div>
                  <div className="card-info">i</div>
                </div>
                <div className="feature-card feature-card-back">
                  <p className="feature-back-text">{f.back}</p>
                  <div className="back-bottom">
                    <img src={f.icon} alt="" className="back-icon" />
                    <span className="back-value">{f.value.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="features-cta">
          <button className="btn-outline btn-with-arrow">
            Interested in the Next Cohort?
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── TRACKS ── */}
      <section id="tracks">
        <div className="section-label">
          About the Program: <span className="green">&nbsp;2026 Program Tracks</span>
        </div>
        <h2>
          Your ideas deserve more than a notebook. They deserve a team, a process, a
          prototype, and a stage.
        </h2>
        <p className="sub">
          You will not just learn about innovation. You will practice it.
        </p>

        {/* TOP ROW — 3 cards */}
        <div className="tracks-grid">
          {[
            {
              icon: buildingsIcon,
              title: "Smart & Sustainable Cities",
              back: "Explore urban innovation and sustainability, researching how technology can make cities smarter, greener, and more livable for future generations.",
            },
            {
              icon: robotIcon,
              title: "AI in Everyday Life",
              back: "Discover how artificial intelligence is transforming daily experiences—from healthcare to education, transportation to entertainment.",
            },
            {
              icon: shapesIcon,
              title: "Digital Product Design",
              back: "Learn the full product design cycle: from empathising and ideation to prototyping and testing. Build digital solutions that solve real problems.",
            },
          ].map((track, i) => {
            const id = `top-${i}`;
            return (
              <div
                key={id}
                className={`track-card-wrapper ${flippedCards[id] ? "flipped" : ""}`}
                onClick={() => toggleFlip(id)}
              >
                <div className="track-card-inner">
                  <div className="track-card track-card-front">
                    <img src={track.icon} alt="" className="track-icon-img" />
                    <div className="card-info">i</div>
                    <h3>{track.title}</h3>
                  </div>
                  <div className="track-card track-card-back">
                    <div className="back-header">
                      <img src={track.icon} alt="" className="back-icon" />
                      <span className="back-title">{track.title}</span>
                    </div>
                    <p className="back-text">{track.back}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ROW — video + Environmental Impact */}
        <div className="tracks-bottom">
          <div className="track-card video-card">
            <img src={videoThumb} alt="" className="video-bg" />
            <div className="play-btn">
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div className="video-content">
              <div className="video-by">By</div>
              <HybrLogo variant="white" size="video" />
            </div>
          </div>

          <div
            className={`track-card-wrapper ${flippedCards["bottom-1"] ? "flipped" : ""}`}
            onClick={() => toggleFlip("bottom-1")}
          >
            <div className="track-card-inner">
              <div className="track-card track-card-front">
                <img src={cometIcon} alt="" className="track-icon-img" />
                <div className="card-info">i</div>
                <h3>Environmental Impact</h3>
              </div>
              <div className="track-card track-card-back">
                <div className="back-header">
                  <img src={cometIcon} alt="" className="back-icon" />
                  <span className="back-title">Environmental Impact</span>
                </div>
                <p className="back-text">
                  Tackle environmental challenges through data-driven research and innovative
                  solutions. Develop projects that address climate change and sustainability.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-outline btn-with-arrow" onClick={() => navigate("/login")}>
          Registered? Let's Begin
          <span className="btn-arrow">→</span>
        </button>
      </section>

      {/* ── PHASES ── */}
      <section id="phases">
        <div className="phases-card">
          <div className="phases-top">
            <div>
              <div className="phases-label">
                About the Program: <span className="blue">Phases</span>
              </div>
              <h2>Your 8-Week Alpha Roadmap</h2>
              <p className="desc">
                Every week has a mission. Every mission moves you closer to your final solution.
              </p>
            </div>
            <ul className="phases-list">
              {[
                {
                  icon: routeBlueIcon,
                  label: "Onboarding",
                  desc: "Understand the Why, Who, What, and How.",
                },
                {
                  icon: searchBlueIcon,
                  label: "Insight",
                  desc: "Turn a Big Issue into a Real Problem.",
                },
                {
                  icon: brainBlueIcon,
                  label: "Innovation",
                  desc: "Move from Insights to Ideas.",
                },
                {
                  icon: wandBlueIcon,
                  label: "Demo Day",
                  desc: "Build small. Learn fast. Improve smarter.",
                },
              ].map((p, i) => (
                <li key={i} className="phase-item">
                  <img src={p.icon} alt="" className="phase-icon-img" />
                  <span>
                    <strong>{p.label}:</strong>{" "}
                    <span className="desc-text">{p.desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="phases-image">
            <img src={phasesImg} alt="" className="phases-img" />
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section id="curriculum">
        <div className="inner">
          <div className="syllabus-hero">
            <div className="syllabus-img-wrap">
              <img src={syllabusImg} alt="" className="syllabus-img" />
            </div>
            <div className="syllabus-text">
              <div className="section-label">
                About the Program: <span className="blue">The Roadmap</span>
              </div>
              <h2>
                Find everything you need to manage your journey once you log in.
              </h2>
              <p className="sub">
                Inside the LMS, you can view your weekly missions, watch instructional
                videos, download templates, submit deliverables, track your progress,
                receive announcements, and more.
              </p>
            </div>
          </div>
        </div>

        <div className="zigzag-wrap">
          <img src={wireframeTr} alt="" className="wire wire-tr" />
          <img src={wireframeBl} alt="" className="wire wire-ml" />
          <img src={wireframeTr} alt="" className="wire wire-br" />
          <img src={wireframeBl} alt="" className="wire wire-bl" />
          <img src={arrowWhite} alt="" className="arrow arrow-1" />
          <img src={arrowBlue} alt="" className="arrow arrow-2" />
          <img src={arrowGreen} alt="" className="arrow arrow-3" />

          <div className="zig-block zig-1">
            <div className="zig-title">
              <img src={routeIcon} alt="" className="zig-icon-img" />
              Onboarding
            </div>
            <div className="zig-overview">Understand the Why, Who, What, and How</div>
            <ul className="zig-checks">
              <li>Attend the kickoff session</li>
              <li>Meet your team</li>
              <li>Understand how the program works</li>
              <li>Begin learning the habits of strong innovators</li>
            </ul>
          </div>

          <div className="zig-block zig-2">
            <div className="zig-title">
              <img src={searchIcon} alt="" className="zig-icon-img" />
              Insight
            </div>
            <div className="zig-overview">Turn a Big Issue into a Real Problem</div>
            <ul className="zig-checks">
              <li>What problem do you want to investigate?</li>
              <li>Who is affected?</li>
              <li>Why does it matter?</li>
              <li>What assumptions do you need to test?</li>
            </ul>
          </div>

          <div className="zig-block zig-3">
            <div className="zig-title">
              <img src={brainIcon} alt="" className="zig-icon-img" />
              Innovation
            </div>
            <div className="zig-overview">Move from Insights to Ideas</div>
            <ul className="zig-checks">
              <li>Form "How Might We" questions</li>
              <li>Generate multiple solution ideas</li>
              <li>Refine top, shortlisted concepts</li>
              <li>Choose 1 solution direction</li>
            </ul>
          </div>

          <div className="zig-block zig-4">
            <div className="zig-title">
              <img src={wandIcon} alt="" className="zig-icon-img" />
              Demo Day
            </div>
            <div className="zig-overview">Build small. Learn fast. Improve smarter.</div>
            <ul className="zig-checks">
              <li>Discover your top assumptions</li>
              <li>Understand what you will build</li>
              <li>Develop your final solution and prototype</li>
              <li>Prepare for the showcase</li>
            </ul>
          </div>
        </div>

        <div className="curriculum-cta">
          <button className="btn-outline btn-with-arrow" onClick={() => navigate("/login")}>
            Excited? Start Your Journey
            <span className="btn-arrow">→</span>
          </button>
          <button className="btn-outline btn-with-arrow">
            Register with 7Edu
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS with sliding animation ── */}
      <section id="testimonials">
        <div className="section-label">Testimonials</div>
        <h2>Hear from past interns</h2>
        <p className="sub">
          Captivating supporting statement that introduces the "testimonial" section, with
          text reviews from HYBR's previous interns.
        </p>

        <div
          className="testimonial-stage"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <button
            className="t-arrow t-arrow-left"
            onClick={() => setTIdx((tIdx - 1 + testimonials.length) % testimonials.length)}
            aria-label="Previous testimonial"
          >
            <svg width="24" height="44" viewBox="0 0 24 44" fill="none" stroke="#4FC2F0" strokeWidth="3">
              <path d="M20 4 L4 22 L20 40" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* ── Slider viewport ── */}
          <div className="testimonial-viewport">
            <div
              className="testimonial-track"
              style={{ transform: `translateX(-${tIdx * 100}%)` }}
            >
              {testimonials.map((item, i) => (
                <div className="testimonial-slide" key={i}>
                  <div className="testimonial-card">
                    <div className="testimonial-avatar-wrap">
                      <span className="ring ring-outer" />
                      <span className="ring ring-inner" />
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="testimonial-photo" />
                      ) : (
                        <div className="testimonial-avatar-placeholder" />
                      )}
                    </div>
                    <div className="testimonial-body">
                      <p className="testimonial-quote">"{item.quote}"</p>
                      <div className="testimonial-name">{item.name}</div>
                      <div className="testimonial-meta">{item.meta}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="t-arrow t-arrow-right"
            onClick={() => setTIdx((tIdx + 1) % testimonials.length)}
            aria-label="Next testimonial"
          >
            <svg width="24" height="44" viewBox="0 0 24 44" fill="none" stroke="#4FC2F0" strokeWidth="3">
              <path d="M4 4 L20 22 L4 40" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <div
              key={i}
              onClick={() => setTIdx(i)}
              className={`t-dot ${i === tIdx ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="reg-pill-wrap">
          <button className="btn-outline btn-with-arrow">
            Interested in the Next Cohort?
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta">
        <h2>
          Are you or a loved one interested in joining the next Alpha cohort? Or are you
          interested in working with us at <span className="blue">HYBR</span>? We'd love
          to hear from you!
        </h2>
        <p>
          Alpha is not just an after-school program. It is your launchpad for learning how to
          think clearly, build boldly, and turn ideas into real-world impact.
        </p>
        <p>Log in. Team up. Build what's next.</p>
        <div className="cta-buttons">
          <button className="btn-outline btn-with-arrow">
            Connect with 7Edu
            <span className="btn-arrow">→</span>
          </button>
          <button className="btn-solid btn-with-arrow">
            Connect With HYBR
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <div className="footer-wrapper">
        <footer>
          <div className="footer-grid">

            {/* Column 1: ABOUT THE PROGRAM */}
            <div className="footer-col">
              <h4>About the Program</h4>
              <a onClick={() => scrollTo("about")}>About ALPHA</a>
              <a onClick={() => scrollTo("features")}>Program Features</a>
              <a onClick={() => scrollTo("tracks")}>2026 Tracks</a>
              <a onClick={() => scrollTo("phases")}>Program Phases</a>
              <a onClick={() => scrollTo("curriculum")}>Program Modules/Syllabus</a>
            </div>

            {/* Column 2: TESTIMONIALS + MORE */}
            <div className="footer-col">
              <h4>Testimonials</h4>
              <a onClick={() => scrollTo("testimonials")}>Student Testimonials</a>
              
              <h4 style={{ marginTop: 40 }}>More</h4>
              <a onClick={() => scrollTo("cta")}>Register for ALPHA</a>
              <a 
                href="https://hybrgroup.net/"
                target="_blank" 
                rel="noopener noreferrer"
              >
                Connect With HYBR
              </a>
            </div>

            {/* Column 3: CONTACT US */}
            <div className="footer-col">
              <h4>Contact Us</h4>
              <a>Address 1</a>
              <a href="mailto:sale@hybrgroup.net">Email: sale@hybrgroup.net</a>
            </div>

            {/* Column 4: FOLLOW US + LOG IN */}
            <div className="footer-col">
              <h4>Follow Us</h4>
              <div className="footer-socials">
                <a href="https://www.instagram.com/hybrgrouphq/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href="https://www.linkedin.com/company/hybr/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                  <LinkedInIcon />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X (Twitter)">
                  <XIcon />
                </a>
                <a href="https://www.youtube.com/channel/UCB0X8x3rMz0MC7pkT0EBztQ" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                  <YouTubeIcon />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Medium">
                  <MediumIcon />
                </a>
                <a href="https://www.tiktok.com/@hybrgroup" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              </div>
              <button 
                className="btn-footer-login btn-with-arrow" 
                onClick={() => navigate("/login")}
              >
                LOG IN
                <span className="btn-arrow">→</span>
              </button>
            </div>

          </div>

          <div className="footer-bottom">
            <div className="footer-legal">
              <a>Privacy Policy</a>
              <a>Terms &amp; Conditions</a>
            </div>
            <div className="footer-brand">
              <div className="brand-dot"></div>
              <span className="footer-by">BY</span>
              <HybrLogo variant="black" size="footer" />
            </div>
            <div className="footer-copy">© 2026 HYBR GROUP</div>
          </div>

          <img src={hybrMarkColor} alt="" className="footer-rainbow-img" />
        </footer>
      </div>
    </>
  );
}

// ── APP WITH ROUTING ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
       <Routes>
  {/* ── PUBLIC ROUTES ── */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/verify-email" element={<VerifyEmailPage />} />

  {/* ── STUDENT PROTECTED ROUTES ── */}
  <Route 
    path="/dashboard" 
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <DashboardPage />
      </ProtectedRoute>
    } 
  />
  <Route 
  path="/profile" 
  element={
    <ProtectedRoute allowedRoles={["admin", "coach", "student"]}>
      <ProfilePage />
    </ProtectedRoute>
  } 
/>
  {/* ── DYNAMIC WEEK & LESSON ROUTES (these handle ALL lessons) ── */}
  <Route 
    path="/week/:weekNumber" 
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <WeekPage />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/lesson/:weekNumber/:lessonId" 
    element={
      <ProtectedRoute allowedRoles={["student"]}>
        <LessonRouter />
      </ProtectedRoute>
    } 
  />

  {/* ── PASSWORD CHANGE (all roles) ── */}
  <Route 
    path="/change-password" 
    element={
      <ProtectedRoute allowedRoles={["admin", "coach", "student"]}>
        <ChangePasswordPage />
      </ProtectedRoute>
    } 
  />
<Route 
  path="/courses/overview" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <CourseOverviewPage />
    </ProtectedRoute>
  } 
/>
  {/* ── ADMIN PROTECTED ROUTES ── */}
  <Route 
    path="/admin/dashboard" 
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/admin/users" 
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminUsers />
      </ProtectedRoute>
    } 
  />
  <Route 
  path="/admin/classes" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminClasses />
    </ProtectedRoute>
  } 
/>
  <Route 
    path="/admin/assignments" 
    element={
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminAssignments />
      </ProtectedRoute>
    } 
  />
<Route 
  path="/my-grades" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentGrades />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/my-grades/:weekNumber/:lessonId" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentGradeDetail />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/resources" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <ResourcesPage />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/my-courses" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <MyCoursesPage />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/cohorts" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminCohorts />
    </ProtectedRoute>
  } 
/>
  {/* ── COACH PROTECTED ROUTES ── */}
  <Route 
    path="/coach/dashboard" 
    element={
      <ProtectedRoute allowedRoles={["coach"]}>
        <CoachDashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/coach/students" 
    element={
      <ProtectedRoute allowedRoles={["coach"]}>
        <CoachStudents />
      </ProtectedRoute>
    } 
  />
  <Route 
  path="/coach/students/:id" 
  element={
    <ProtectedRoute allowedRoles={["coach"]}>
      <CoachStudentDetail />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/coach/grading" 
  element={
    <ProtectedRoute allowedRoles={["coach"]}>
      <CoachGrading />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/coach/grading/:submissionId" 
  element={
    <ProtectedRoute allowedRoles={["coach"]}>
      <CoachGradeStudent />
    </ProtectedRoute>
  } 
/>
{/* ── ADMIN CONTENT MANAGEMENT ── */}
<Route 
  path="/admin/content" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/content/:weekNumber/:lessonId" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminContentEditor />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/achievements" 
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentAchievements />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/admin/analytics" 
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminAnalytics />
    </ProtectedRoute>
  } 
/>
</Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
