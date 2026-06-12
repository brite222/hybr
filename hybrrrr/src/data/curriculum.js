// ── ALPHA Program Curriculum ──
// 8 weeks, each with its own list of lessons
// Each lesson has: id, title, type, duration
//
// Note: All lesson content (titles, body text, surveys, images, etc.)
// is managed by admins through the Admin Content Editor.
// This file only defines the lesson STRUCTURE.

export const CURRICULUM = {
  1: {
    weekNumber: 1,
    title: "Onboarding",
    subtitle: "Understand the Why, Who, What, and How.",
    lessons: [
      { id: "w1-overview",   title: "Week 1 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w1-kickoff",    title: "Kick Off Day",          type: "image",    duration: "10 MIN" },
      { id: "w1-webinar",    title: "Webinar Recording",     type: "video",    duration: "45 MIN" },
      { id: "w1-workplan",   title: "Workplan Template",     type: "download", duration: "5 MIN" },
      { id: "w1-submit",     title: "Filled Workplan",       type: "upload",   duration: "30 MIN" },
    ],
  },
  2: {
    weekNumber: 2,
    title: "Insight",
    subtitle: "Turn a Big Issue into a Real Problem.",
    lessons: [
      { id: "w2-overview",   title: "Week 2 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w2-video",      title: "Explainer Video",       type: "video",    duration: "12 MIN" },
      { id: "w2-audio",      title: "Audio File",            type: "audio",    duration: "8 MIN" },
      { id: "w2-guide",      title: "Guide PDF",             type: "download", duration: "5 MIN" },
      { id: "w2-quiz",       title: "Knowledge Check",       type: "quiz",     duration: "7 MIN" },
      { id: "w2-canvas",     title: "Do It Canvas",          type: "download", duration: "5 MIN" },
      { id: "w2-assignment", title: "Work Assignment",       type: "upload",   duration: "45 MIN" },
      { id: "w2-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  3: {
    weekNumber: 3,
    title: "Discovery",
    subtitle: "Research and gather user insights.",
    lessons: [
      { id: "w3-overview",   title: "Week 3 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w3-video",      title: "Explainer Video",       type: "video",    duration: "12 MIN" },
      { id: "w3-audio",      title: "Audio File",            type: "audio",    duration: "8 MIN" },
      { id: "w3-guide",      title: "Guide PDF",             type: "download", duration: "5 MIN" },
      { id: "w3-quiz",       title: "Knowledge Check",       type: "quiz",     duration: "7 MIN" },
      { id: "w3-canvas",     title: "Do It Canvas",          type: "download", duration: "5 MIN" },
      { id: "w3-assignment", title: "Work Assignment",       type: "upload",   duration: "45 MIN" },
      { id: "w3-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  4: {
    weekNumber: 4,
    title: "Innovation",
    subtitle: "Move from Insights to Ideas.",
    lessons: [
      { id: "w4-overview",   title: "Week 4 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w4-video",      title: "Explainer Video",       type: "video",    duration: "12 MIN" },
      { id: "w4-audio",      title: "Audio File",            type: "audio",    duration: "8 MIN" },
      { id: "w4-guide",      title: "Guide PDF",             type: "download", duration: "5 MIN" },
      { id: "w4-quiz",       title: "Knowledge Check",       type: "quiz",     duration: "7 MIN" },
      { id: "w4-canvas",     title: "Do It Canvas",          type: "download", duration: "5 MIN" },
      { id: "w4-assignment", title: "Work Assignment",       type: "upload",   duration: "45 MIN" },
      { id: "w4-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  5: {
    weekNumber: 5,
    title: "Ideation",
    subtitle: "Generate and refine solution concepts.",
    lessons: [
      { id: "w5-overview",   title: "Week 5 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w5-video",      title: "Explainer Video",       type: "video",    duration: "12 MIN" },
      { id: "w5-audio",      title: "Audio File",            type: "audio",    duration: "8 MIN" },
      { id: "w5-guide",      title: "Guide PDF",             type: "download", duration: "5 MIN" },
      { id: "w5-quiz",       title: "Knowledge Check",       type: "quiz",     duration: "7 MIN" },
      { id: "w5-canvas",     title: "Do It Canvas",          type: "download", duration: "5 MIN" },
      { id: "w5-assignment", title: "Work Assignment",       type: "upload",   duration: "45 MIN" },
      { id: "w5-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  6: {
    weekNumber: 6,
    title: "Prototyping",
    subtitle: "Build small. Learn fast. Improve smarter.",
    lessons: [
      { id: "w6-overview",   title: "Week 6 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w6-video",      title: "Explainer Video",       type: "video",    duration: "12 MIN" },
      { id: "w6-audio",      title: "Audio File",            type: "audio",    duration: "8 MIN" },
      { id: "w6-guide",      title: "Guide PDF",             type: "download", duration: "5 MIN" },
      { id: "w6-quiz",       title: "Knowledge Check",       type: "quiz",     duration: "7 MIN" },
      { id: "w6-canvas",     title: "Do It Canvas",          type: "download", duration: "5 MIN" },
      { id: "w6-assignment", title: "Work Assignment",       type: "upload",   duration: "45 MIN" },
      { id: "w6-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  7: {
    weekNumber: 7,
    title: "Demo Prep",
    subtitle: "Prepare for the showcase.",
    lessons: [
      { id: "w7-overview",   title: "Week 7 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w7-assignment", title: "Work Assignment",       type: "upload",   duration: "60 MIN" },
      { id: "w7-additional", title: "Additional Material",   type: "info",     duration: "15 MIN" },
      { id: "w7-feedback",   title: "Module Feedback",       type: "feedback", duration: "3 MIN" },
    ],
  },
  8: {
    weekNumber: 8,
    title: "Demo Day",
    subtitle: "Present your ideas with confidence.",
    lessons: [
      { id: "w8-overview",   title: "Week 8 Intro",          type: "module",   duration: "5 MIN" },
      { id: "w8-assignment", title: "Final Submission",      type: "upload",   duration: "90 MIN" },
      { id: "w8-additional", title: "Demo Day Resources",    type: "info",     duration: "10 MIN" },
      { id: "w8-feedback",   title: "Program Feedback",      type: "feedback", duration: "5 MIN" },
    ],
  },
};

// ── Helper functions ──
export const getWeek = (weekNumber) => CURRICULUM[weekNumber];

export const getLesson = (weekNumber, lessonId) => {
  const week = CURRICULUM[weekNumber];
  if (!week) return null;
  return week.lessons.find(l => l.id === lessonId);
};

export const getLessonIndex = (weekNumber, lessonId) => {
  const week = CURRICULUM[weekNumber];
  if (!week) return -1;
  return week.lessons.findIndex(l => l.id === lessonId);
};

export const getNextLesson = (weekNumber, lessonId) => {
  const week = CURRICULUM[weekNumber];
  if (!week) return null;
  const idx = getLessonIndex(weekNumber, lessonId);
  if (idx === -1 || idx === week.lessons.length - 1) return null;
  return week.lessons[idx + 1];
};

export const getPrevLesson = (weekNumber, lessonId) => {
  const week = CURRICULUM[weekNumber];
  if (!week) return null;
  const idx = getLessonIndex(weekNumber, lessonId);
  if (idx <= 0) return null;
  return week.lessons[idx - 1];
};

export const getLessonIcon = (type) => {
  const icons = {
    module: "📘",
    image: "🖼️",
    video: "🎥",
    audio: "🎧",
    download: "📥",
    upload: "📤",
    quiz: "📝",
    info: "💡",
    feedback: "💬",
  };
  return icons[type] || "📄";
};