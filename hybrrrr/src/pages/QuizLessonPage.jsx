import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../hooks/useContent";
import { awardPoints } from "../utils/awardPoints";
import StudentSidebar from "../components/StudentSidebar";
import "../styles/module.css";
import "../styles/quiz-lesson.css";
import lessonBannerBg from "../assets/images/lesson-banner-bg.jpg";
import axios from "axios";

const ClockIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const RetakeIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>);
const ArrowLeft = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>);
const ArrowRight = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>);
const HamburgerIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>);

const FALLBACK_QUIZ = [{ q: "1. Lorem ipsum dolor sit amet?", options: ["A", "B", "C", "D"], correct: 0, hint: "💡 Tip: Default question" }];

export default function QuizLessonPage({
  weekNumber, lesson, onNext, onPrev, hasNext, hasPrev,
  nextLessonTitle, prevLessonTitle,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const progress = 25;

  const week = weekNumber || 2;
  const lessonId = lesson?.id || "quiz";
  const { content, loading } = useContent(week, lessonId);

  const title = content?.title || lesson?.title || "Title of Quiz";
  const subtitle = content?.subtitle || "A brief summarising statement.";
  const duration = content?.duration || lesson?.duration || "7 MIN";
  const quizTitle = content?.header || "Quiz: Lorem Ipsum Dolor Sit Amet";
  const questions = (content?.quiz_data && content.quiz_data.length > 0) ? content.quiz_data : FALLBACK_QUIZ;
  const objectives = content?.objectives_json || ["Lorem ipsum dolor sit amet.", "Donec eu urna vel lorem ornare pretium."];
  const resources = content?.resources_json || ['"Lorem ipsum", by Consectetur Adipiscing.', "https://hybrgroup.net/"];

  const totalQs = questions.length;
  const answered = Object.keys(answers).length;
  const score = questions.reduce((sum, q, i) => sum + (answers[i] === q.correct ? 1 : 0), 0);
  const percent = totalQs > 0 ? Math.round((score / totalQs) * 100) : 0;

  const getScoreComment = () => {
    if (percent >= 90) return "Outstanding work! You've truly mastered this lesson.";
    if (percent >= 75) return "Great job! You have a strong grasp of the material.";
    if (percent >= 50) return "Good effort! Review the hints and try again.";
    return "Keep going! Review the lesson and retake the quiz.";
  };

  const select = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (answered < totalQs) { alert("Please answer all questions before submitting."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
      await axios.post(`${API}/api/quiz/submit`,
        { weekNumber: week, lessonId, score, totalQs, percent, answers },
        { headers: { Authorization: `Bearer ${token}` } });
      try { await awardPoints({ lessonId, weekNumber: week, lessonType: "quiz", extra: { correctAnswers: score } }); }
      catch (err) { console.error(err); }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("❌ Failed to save quiz: " + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  const handleRetake = () => {
    setAnswers({}); setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <span className="topbar-subtitle">QUIZ</span>
          </div>
          <div className="module-progress">
            <div className="module-progress-bar"><div className="module-progress-fill" style={{ width: `${progress}%` }} /></div>
            <span className="module-progress-text">{progress}%</span>
          </div>
        </div>

        <div className="quiz-banner" style={{ backgroundImage: `url(${lessonBannerBg})` }}>
          <h1 className="quiz-banner-title">{title}</h1>
          <p className="quiz-banner-sub">{subtitle}</p>
          <div className="quiz-banner-time"><ClockIcon /><span>{duration}</span></div>
        </div>

        {loading ? (<div style={{ padding: 40, textAlign: "center" }}>Loading quiz...</div>) : (
          <div className="quiz-content">
            <div className="quiz-card">
              <h2 className="quiz-title">{quizTitle}</h2>
              {questions.map((q, qIdx) => {
                const userAns = answers[qIdx];
                return (
                  <div className="quiz-question" key={qIdx}>
                    <p className="quiz-q-text">{q.q}</p>
                    <div className="quiz-options">
                      {q.options.map((opt, optIdx) => {
                        const selected = userAns === optIdx;
                        return (
                          <label key={optIdx} className={`quiz-option ${selected ? "selected" : ""} ${submitted ? "locked" : ""}`}>
                            <input type="radio" name={`q-${qIdx}`} checked={selected} onChange={() => select(qIdx, optIdx)} disabled={submitted} />
                            <span className="quiz-radio-dot" />
                            <span className="quiz-option-text">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {submitted && q.hint && <div className="quiz-hint"><span>{q.hint}</span></div>}
                  </div>
                );
              })}
              <button className={`quiz-submit-btn ${submitted ? "disabled" : ""}`} onClick={handleSubmit} disabled={submitted || saving}>
                {saving ? "Saving..." : submitted ? "Submitted" : "Submit"}
              </button>
              {submitted && (
                <div className="quiz-score-card">
                  <h3 className="quiz-score-title">Your Score</h3>
                  <p className="quiz-score-sub">{getScoreComment()}</p>
                  <div className="quiz-score-row">
                    <div className="quiz-score-ring">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#16a34a" strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 52}
                          strokeDashoffset={(2 * Math.PI * 52) * (1 - percent / 100)}
                          transform="rotate(-90 60 60)" />
                      </svg>
                      <div className="quiz-score-percent">{percent}%</div>
                    </div>
                    <button className="quiz-retake-btn" onClick={handleRetake}>
                      <RetakeIcon /><span>RETAKE TEST</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <aside className="quiz-side">
              <div className="quiz-side-card">
                <h4 className="quiz-side-title">Objectives</h4>
                <ul>{objectives.map((o, i) => <li key={i}>{o}</li>)}</ul>
              </div>
              <div className="quiz-side-card">
                <h4 className="quiz-side-title">Learn More</h4>
                <ul>
                  {resources.map((r, i) => (
                    <li key={i}>
                      {r.startsWith && r.startsWith("http") ? (<>🔗 <a href={r} target="_blank" rel="noreferrer">{r}</a></>) : (<strong>{r}</strong>)}
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