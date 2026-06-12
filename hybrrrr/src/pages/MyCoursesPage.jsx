import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";
import StudentSidebar from "../components/StudentSidebar";
import courseThumb from "../assets/images/hand.png";
import "../styles/module.css";
import "../styles/dashboard.css";

// ── Icons ──
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const BookIcon = () => (
  <svg width="26" height="22" viewBox="0 0 42 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40.5 0H27C25.8357 0 24.6873 0.271088 23.6459 0.791796C22.6045 1.3125 21.6986 2.06853 21 3C20.3014 2.06853 19.3955 1.3125 18.3541 0.791796C17.3127 0.271088 16.1643 0 15 0H1.5C1.10218 0 0.720644 0.158036 0.43934 0.43934C0.158035 0.720645 0 1.10218 0 1.5V28.5C0 28.8978 0.158035 29.2794 0.43934 29.5607C0.720644 29.842 1.10218 30 1.5 30H15C16.1935 30 17.3381 30.4741 18.182 31.318C19.0259 32.1619 19.5 33.3065 19.5 34.5C19.5 34.8978 19.658 35.2794 19.9393 35.5607C20.2206 35.842 20.6022 36 21 36C21.3978 36 21.7794 35.842 22.0607 35.5607C22.342 35.2794 22.5 34.8978 22.5 34.5C22.5 33.3065 22.9741 32.1619 23.818 31.318C24.6619 30.4741 25.8065 30 27 30H40.5C40.8978 30 41.2794 29.842 41.5607 29.5607C41.842 29.2794 42 28.8978 42 28.5V1.5C42 1.10218 41.842 0.720645 41.5607 0.43934C41.2794 0.158036 40.8978 0 40.5 0ZM15 27H3V3H15C16.1935 3 17.3381 3.47411 18.182 4.31802C19.0259 5.16193 19.5 6.30653 19.5 7.5V28.5C18.203 27.524 16.6232 26.9974 15 27ZM39 27H27C25.3768 26.9974 23.797 27.524 22.5 28.5V7.5C22.5 6.30653 22.9741 5.16193 23.818 4.31802C24.6619 3.47411 25.8065 3 27 3H39V27ZM27 7.5H34.5C34.8978 7.5 35.2794 7.65804 35.5607 7.93934C35.842 8.22064 36 8.60218 36 9C36 9.39782 35.842 9.77936 35.5607 10.0607C35.2794 10.342 34.8978 10.5 34.5 10.5H27C26.6022 10.5 26.2206 10.342 25.9393 10.0607C25.658 9.77936 25.5 9.39782 25.5 9C25.5 8.60218 25.658 8.22064 25.9393 7.93934C26.2206 7.65804 26.6022 7.5 27 7.5ZM36 15C36 15.3978 35.842 15.7794 35.5607 16.0607C35.2794 16.342 34.8978 16.5 34.5 16.5H27C26.6022 16.5 26.2206 16.342 25.9393 16.0607C25.658 15.7794 25.5 15.3978 25.5 15C25.5 14.6022 25.658 14.2206 25.9393 13.9393C26.2206 13.658 26.6022 13.5 27 13.5H34.5C34.8978 13.5 35.2794 13.658 35.5607 13.9393C35.842 14.2206 36 14.6022 36 15ZM36 21C36 21.3978 35.842 21.7794 35.5607 22.0607C35.2794 22.342 34.8978 22.5 34.5 22.5H27C26.6022 22.5 26.2206 22.342 25.9393 22.0607C25.658 21.7794 25.5 21.3978 25.5 21C25.5 20.6022 25.658 20.2206 25.9393 19.9393C26.2206 19.658 26.6022 19.5 27 19.5H34.5C34.8978 19.5 35.2794 19.658 35.5607 19.9393C35.842 20.2206 36 20.6022 36 21Z" fill="#196AB4"/>
  </svg>
);
const GradesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24.0006 4.5C23.6028 4.5 23.2212 4.65804 22.9399 4.93934C22.6586 5.22064 22.5006 5.60218 22.5006 6V16.5C22.5006 16.8978 22.6586 17.2794 22.9399 17.5607C23.2212 17.842 23.6028 18 24.0006 18C25.3213 18.0003 26.6051 18.4364 27.6527 19.2406C28.7004 20.0448 29.4534 21.1723 29.795 22.4481C30.1367 23.7239 30.0478 25.0767 29.5422 26.2969C29.0366 27.517 28.1425 28.5362 26.9986 29.1965C25.8548 29.8567 24.525 30.1211 23.2156 29.9486C21.9061 29.7761 20.6902 29.1764 19.7564 28.2424C18.8225 27.3084 18.2229 26.0924 18.0505 24.783C17.8782 23.4735 18.1427 22.1438 18.8031 21C18.9016 20.8294 18.9656 20.641 18.9913 20.4457C19.017 20.2503 19.004 20.0518 18.9529 19.8615C18.9019 19.6712 18.8139 19.4928 18.6939 19.3365C18.574 19.1802 18.4244 19.0491 18.2537 18.9506L9.15995 13.7006C8.98933 13.6021 8.80096 13.5381 8.60561 13.5124C8.41027 13.4867 8.21177 13.4997 8.02146 13.5508C7.83114 13.6018 7.65275 13.6898 7.49646 13.8098C7.34016 13.9297 7.20904 14.0793 7.11058 14.25C4.96432 17.9674 4.10464 22.2892 4.66486 26.545C5.22508 30.8007 7.17388 34.7528 10.209 37.7881C13.2442 40.8235 17.1961 42.7726 21.4519 43.333C25.7076 43.8935 30.0294 43.0341 33.747 40.8881C37.4646 38.7421 40.3701 35.4294 42.0131 31.4638C43.6561 27.4981 43.9447 23.1012 42.8341 18.9548C41.7235 14.8085 39.2758 11.1444 35.8707 8.53094C32.4655 5.91745 28.2931 4.50055 24.0006 4.5ZM9.01745 17.0812L15.5631 20.8612C15.1906 21.8658 15.0001 22.9286 15.0006 24C15.0006 24.2869 15.0156 24.5625 15.0418 24.8475L7.74058 26.8125C7.17119 23.5143 7.61645 20.1209 9.01745 17.0812ZM8.51683 29.7019L15.8293 27.7444C16.4407 29.077 17.3678 30.2406 18.5302 31.1341C19.6927 32.0277 21.0555 32.6244 22.5006 32.8725V40.4306C19.3953 40.1428 16.4346 38.9828 13.9603 37.0844C11.486 35.1861 9.59893 32.6268 8.51683 29.7019ZM25.5006 40.4306V32.8725C27.5969 32.5172 29.4997 31.4312 30.8717 29.807C32.2438 28.1828 32.9965 26.1252 32.9965 23.9991C32.9965 21.8729 32.2438 19.8154 30.8717 18.1911C29.4997 16.5669 27.5969 15.4809 25.5006 15.1256V7.5675C29.5997 7.94201 33.4108 9.83512 36.1858 12.8752C38.9608 15.9153 40.4993 19.8829 40.4993 23.9991C40.4993 28.1152 38.9608 32.0828 36.1858 35.1229C33.4108 38.163 29.5997 40.0561 25.5006 40.4306Z" fill="#196AB4"/>
  </svg>
);
const GradCapIcon = () => (
  <svg width="24" height="20" viewBox="0 0 48 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.2045 12.176L24.7045 0.176C24.4875 0.0604402 24.2454 0 23.9995 0C23.7537 0 23.5116 0.0604402 23.2945 0.176L0.794531 12.176C0.554539 12.3039 0.353832 12.4946 0.213881 12.7278C0.07393 12.961 0 13.2278 0 13.4998C0 13.7717 0.07393 14.0385 0.213881 14.2717C0.353832 14.5049 0.554539 14.6956 0.794531 14.8235L5.99953 17.6004V26.6791C5.99797 27.4159 6.26914 28.1272 6.76078 28.676C9.21703 31.4116 14.7202 35.9998 23.9995 35.9998C27.0763 36.0252 30.1301 35.4679 32.9995 34.3573V40.4998C32.9995 40.8976 33.1576 41.2791 33.4389 41.5604C33.7202 41.8417 34.1017 41.9998 34.4995 41.9998C34.8974 41.9998 35.2789 41.8417 35.5602 41.5604C35.8415 41.2791 35.9995 40.8976 35.9995 40.4998V32.9079C37.9555 31.7787 39.7231 30.3509 41.2383 28.676C41.7299 28.1272 42.0011 27.4159 41.9995 26.6791V17.6004L47.2045 14.8235C47.4445 14.6956 47.6452 14.5049 47.7852 14.2717C47.9251 14.0385 47.9991 13.7717 47.9991 13.4998C47.9991 13.2278 47.9251 12.961 47.7852 12.7278C47.6452 12.4946 47.4445 12.3039 47.2045 12.176ZM23.9995 32.9998C15.8864 32.9998 11.1145 29.036 8.99953 26.6791V19.1997L23.2945 26.8235C23.5116 26.9391 23.7537 26.9995 23.9995 26.9995C24.2454 26.9995 24.4875 26.9391 24.7045 26.8235L32.9995 22.4004V31.0891C30.637 32.1916 27.6595 32.9998 23.9995 32.9998ZM38.9995 26.6716C38.1004 27.6694 37.0943 28.5654 35.9995 29.3435V20.7991L38.9995 19.1997V26.6716ZM35.2495 17.801L35.2083 17.7766L24.7083 12.176C24.358 11.9971 23.9514 11.9629 23.5761 12.0809C23.2008 12.1989 22.8869 12.4595 22.702 12.8067C22.5171 13.1539 22.476 13.5599 22.5875 13.9371C22.699 14.3143 22.9543 14.6327 23.2983 14.8235L32.062 19.4998L23.9995 23.7991L4.68703 13.4998L23.9995 3.20038L43.312 13.4998L35.2495 17.801Z" fill="white"/>
  </svg>
);
const ViewIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

// ── Progress Ring ──
function ProgressRing({ percent, size = 90, strokeWidth = 8, color = "#8DC540", dark = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const trackColor = dark ? "rgba(255,255,255,0.15)" : "#E5E5E5";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Montserrat, sans-serif", fontWeight: 700,
        fontSize: size > 90 ? 22 : 14,
        color: dark ? "#fff" : "#000",
      }}>
        {percent}%
      </div>
    </div>
  );
}

// ── Status pill ──
const StatusPill = ({ type, text }) => {
  const styles = {
    submitted: { bg: "#8DC540", color: "#fff" },
    "not-started": { bg: "#D5D5D5", color: "#666" },
    ungraded: { bg: "#D5D5D5", color: "#666" },
    graded: { bg: "#8DC540", color: "#fff" },
  };
  const s = styles[type] || styles["not-started"];
  return (
    <span style={{
      padding: "5px 12px", borderRadius: 4,
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
      textTransform: "uppercase", fontFamily: "Montserrat, sans-serif",
      whiteSpace: "nowrap", minWidth: 90, textAlign: "center", display: "inline-block",
    }}>{text}</span>
  );
};

export default function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [grades, setGrades] = useState({ submissions: [], by_week: {} });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/program"),
      api.get("/program/my-grades").catch(() => ({ data: { submissions: [], by_week: {} } })),
    ])
      .then(([programRes, gradesRes]) => {
        setProgram(programRes.data);
        setGrades(gradesRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentWeek = program?.currentWeek || 1;
  const currentWeekData = CURRICULUM[currentWeek];

  // Top progress bar — current week completion %
  const currentWeekFromProgram = program?.weeks?.find(w => w.weekNumber === currentWeek);
  const currentWeekCompletedCount = currentWeekFromProgram?.completedCount || 0;
  const currentWeekTotalLessons = currentWeekData?.lessons?.length || 0;
  const topProgress = currentWeekTotalLessons > 0
    ? Math.round((currentWeekCompletedCount / currentWeekTotalLessons) * 100) : 0;

  // Overall course progress
  const totalCompleted = program?.weeks?.reduce((sum, w) => sum + (w.completedCount || 0), 0) || 0;
  const totalLessons = (program?.weeks?.length || 8) * 8;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Current week's grades average (for the "My Average: Week X" card)
  const currentWeekSubs = grades.by_week?.[currentWeek] || [];
  const currentWeekGraded = currentWeekSubs.filter(s => s.is_graded);
  const currentWeekAvg = currentWeekGraded.length > 0
    ? Math.round(currentWeekGraded.reduce((sum, s) => sum + s.percent, 0) / currentWeekGraded.length)
    : 0;

  // Current week's gradeable assignments (preview)
  const gradeableLessons = currentWeekData?.lessons?.filter(l =>
    l.type === "upload" || l.type === "quiz" || l.type === "feedback"
  ) || [];

  const previewAssignments = gradeableLessons.map(lesson => {
    const sub = currentWeekSubs.find(s => s.lesson_id === lesson.id);
    return { title: lesson.title, lessonId: lesson.id, submission: sub || null };
  });

  const courseStatus = overallProgress >= 100 ? "COMPLETE" : "IN PROGRESS";

  return (
    <div className="module-page">
      <div className="mobile-top-header">
        <div className="mobile-top-header-logo">ALPHA</div>
        <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          <HamburgerIcon />
        </button>
      </div>
      <div className={`mobile-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)} />
      <StudentSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main className="module-main">
        {/* ── TOP PROGRESS BAR ── */}
        <div className="module-topbar">
          <div className="module-topbar-label">
            <span className="topbar-title">WEEK {currentWeek}</span>
            <span className="topbar-dot">•</span>
            <span className="topbar-subtitle">{currentWeekData?.title?.toUpperCase() || ""} PHASE</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar">
              <div className="module-progress-fill" style={{ width: `${topProgress}%` }} />
            </div>
            <span className="module-progress-text">{topProgress}%</span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 80, textAlign: "center", color: "#666" }}>Loading your courses...</div>
        ) : (
          <>
            {/* ── KICK-OFF REMINDER BANNER (Week 1 only) ── */}
            {currentWeek === 1 && program?.cohort?.startDate && (
              <div className="kickoff-banner">
                <span className="kickoff-emoji">🚀</span>
                <div className="kickoff-content">
                  <div className="kickoff-title">LOREM REMINDER!</div>
                  <div className="kickoff-date">
                    DATE: {new Date(program.cohort.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}
                  </div>
                </div>
                <span className="kickoff-emoji">🚀</span>
              </div>
            )}

            {/* ── ALL COURSES CARD ── */}
            <div className="dash-section-card">
              <div className="dash-section-header">
                <BookIcon />
                <h2 className="dash-section-title">All Courses</h2>
              </div>
              <p className="dash-section-sub">
                Your enrolled programs and current standing.
              </p>

              {/* Hero course card */}
              <div
                className="course-hero-card"
                onClick={() => navigate("/courses/overview")}
                style={{ backgroundImage: `url(${courseThumb})` }}
              >
                <div className="course-hero-overlay" />
                <div className="course-hero-content">
                  <div className="course-hero-status">{courseStatus}</div>
                  <h3 className="course-hero-title">
                    {program?.cohort?.name || "ALPHA 2026 Summer"}
                    <span className="course-hero-icon"><GradCapIcon /></span>
                  </h3>
                  <p className="course-hero-sub">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </div>
                <div className="course-hero-ring">
                  <ProgressRing percent={overallProgress} size={90} strokeWidth={8} dark />
                </div>
              </div>
            </div>

            {/* ── CURRENT PHASE / MY GRADES CARD ── */}
            <div className="dash-section-card">
              {/* Phase header with ring on right */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 24, marginBottom: 20, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    fontFamily: "Raleway, sans-serif", fontWeight: 700,
                    fontSize: 11, letterSpacing: 1.8, marginBottom: 6,
                  }}>
                    <span style={{ color: "#648C2D" }}>CURRENT PHASE: </span>
                    <span style={{ color: "#196AB4" }}>{currentWeekData?.title?.toUpperCase() || ""}</span>
                  </div>
                  <h2 style={{
                    fontFamily: "Raleway, sans-serif", fontSize: 24, fontWeight: 600,
                    margin: 0, color: "#000",
                  }}>
                    My Average: Week {currentWeek}
                  </h2>
                </div>
                <ProgressRing percent={currentWeekAvg} size={90} strokeWidth={8} />
              </div>

              {/* My Grades sub-header with VIEW ALL button */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <GradesIcon />
                  <h3 style={{
                    fontFamily: "Raleway, sans-serif", fontSize: 18, fontWeight: 600,
                    margin: 0, color: "#000",
                  }}>
                    My Grades
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/my-grades")}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", background: "#F5F5F5",
                    border: "none", borderRadius: 100, cursor: "pointer",
                    fontFamily: "Montserrat, sans-serif", fontSize: 12, fontWeight: 600,
                    letterSpacing: 1, textTransform: "uppercase", color: "#000",
                  }}
                >
                  <ViewIcon /> View All
                </button>
              </div>
              <p style={{
                fontFamily: "Montserrat, sans-serif", fontSize: 13, color: "#888",
                margin: "0 0 16px 0",
              }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>

              {/* Assignment preview rows */}
              {previewAssignments.length === 0 ? (
                <div style={{
                  padding: 20, textAlign: "center", color: "#888",
                  fontFamily: "Montserrat, sans-serif", fontSize: 13,
                }}>
                  No assignments in this week.
                </div>
              ) : (
                previewAssignments.map((a, idx) => {
                  const sub = a.submission;
                  const isSubmitted = !!sub;
                  const isGraded = sub?.is_graded;
                  const percent = isGraded ? sub.percent : 0;
                  const canClick = isSubmitted;

                  return (
                    <div
                      key={a.lessonId}
                      onClick={() => canClick && navigate(`/my-grades/${currentWeek}/${a.lessonId}`)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 110px 60px 110px",
                        alignItems: "center", gap: 12,
                        padding: "14px 16px", marginBottom: 8,
                        border: "1px solid #EDEDED", borderRadius: 10,
                        cursor: canClick ? "pointer" : "default",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { if (canClick) e.currentTarget.style.background = "#FAFAFA"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{
                        fontFamily: "Montserrat, sans-serif", fontWeight: 600,
                        fontSize: 14, color: "#000",
                      }}>{a.title}</div>
                      <div style={{ textAlign: "center" }}>
                        <StatusPill
                          type={isSubmitted ? "submitted" : "not-started"}
                          text={isSubmitted ? "SUBMITTED" : "NOT STARTED"}
                        />
                      </div>
                      <div style={{
                        textAlign: "center", fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700, fontSize: 14,
                        color: isGraded ? (percent >= 75 ? "#8DC540" : percent >= 40 ? "#F0AD4E" : "#999") : "#999",
                      }}>{percent}%</div>
                      <div style={{ textAlign: "center" }}>
                        <StatusPill
                          type={isGraded ? "graded" : "ungraded"}
                          text={isGraded ? "GRADED" : "UNGRADED"}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}