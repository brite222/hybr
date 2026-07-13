import { useParams, useNavigate } from "react-router-dom";
import { getLesson, getNextLesson, getPrevLesson } from "../data/curriculum";
import { awardPoints } from "../utils/awardPoints";
import { useWeekProgress } from "../hooks/useWeekProgress";   // ✅ NEW

import ModulePage from "./ModulePage";
import ImageLessonPage from "./ImageLessonPage";
import VideoLessonPage from "./VideoLessonPage";
import AudioLessonPage from "./AudioLessonPage";
import DownloadLessonPage from "./DownloadLessonPage";
import UploadLessonPage from "./UploadLessonPage";
import QuizLessonPage from "./QuizLessonPage";
import InfoLessonPage from "./InfoLessonPage";
import FeedbackLessonPage from "./FeedbackLessonPage";

const LESSON_COMPONENTS = {
  module: ModulePage,
  image: ImageLessonPage,
  video: VideoLessonPage,
  audio: AudioLessonPage,
  download: DownloadLessonPage,
  upload: UploadLessonPage,
  quiz: QuizLessonPage,
  info: InfoLessonPage,
  feedback: FeedbackLessonPage,
};

export default function LessonRouter() {
  const { weekNumber, lessonId } = useParams();
  const navigate = useNavigate();

  const week = parseInt(weekNumber);
  const lesson = getLesson(week, lessonId);

  // ✅ Get real progress for this week (same source as Course Overview)
  const { progress } = useWeekProgress(week);

  if (!lesson) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Lesson not found</h2>
        <button onClick={() => navigate(`/week/${weekNumber}`)}>← Back to Week</button>
      </div>
    );
  }

  const Component = LESSON_COMPONENTS[lesson.type];

  if (!Component) {
    return <div style={{ padding: 40 }}>Unknown lesson type: {lesson.type}</div>;
  }

  const nextLesson = getNextLesson(week, lessonId);
  const prevLesson = getPrevLesson(week, lessonId);

  const handleNext = async (extras = {}) => {
    const result = await awardPoints({
      lessonId: lesson.id,
      weekNumber: week,
      lessonType: lesson.type,
      extra: extras && Object.keys(extras).length ? extras : null,
    });

    if (result?.pointsEarned) {
      showPointsToast(result.pointsEarned, result.surveyBonus);
    }

    if (nextLesson) {
      navigate(`/lesson/${week}/${nextLesson.id}`);
    } else {
      navigate(`/week/${week}`);
    }
  };

  const handlePrev = () => {
    if (prevLesson) {
      navigate(`/lesson/${week}/${prevLesson.id}`);
    } else {
      navigate(`/week/${week}`);
    }
  };

  return (
    <Component
      weekNumber={week}
      lesson={lesson}
      onNext={handleNext}
      onPrev={handlePrev}
      hasNext={!!nextLesson}
      hasPrev={!!prevLesson}
      nextLessonTitle={nextLesson?.title}
      prevLessonTitle={prevLesson?.title}
      progress={progress}   // ✅ NEW — pass real progress to every lesson page
    />
  );
}

// ── Toast notification for earning points ──
function showPointsToast(points, surveyBonus = 0) {
  const toast = document.createElement("div");
  const bonusText = surveyBonus > 0
    ? `<div style="font-size:12px;font-weight:500;margin-top:4px;opacity:0.95;">Includes +${surveyBonus} survey bonus 🎉</div>`
    : "";
  toast.innerHTML = `
    <div>🎉 +${points} points earned!</div>
    ${bonusText}
  `;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: linear-gradient(135deg, #8DC540, #648C2D);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 8px 24px rgba(141, 197, 64, 0.4);
    z-index: 9999;
    animation: slideIn 0.4s ease, fadeOut 0.4s ease 2.6s;
    min-width: 240px;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; transform: translateX(400px); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 3000);
}