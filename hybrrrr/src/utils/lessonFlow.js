// ── Lesson sequence per week (matches the official curriculum) ──
export const WEEK_LESSONS = {
  1: ["image", "video", "download", "upload"],
  2: ["video", "audio", "download", "quiz", "download", "upload", "image"],
  3: ["video", "audio", "download", "quiz", "download", "upload", "image"],
  4: ["video", "audio", "download", "quiz", "download", "upload", "image"],
  5: ["video", "audio", "download", "quiz", "download", "upload", "image"],
  6: ["video", "audio", "download", "quiz", "download", "upload", "image"],
  7: ["upload", "image", "image"],
  8: ["upload", "image", "image"],
};

// ── Helper: given week & current lesson, return prev/next routes ──
export function getLessonNav(weekNumber, currentLessonType, currentIndex = 0) {
  const week = Number(weekNumber) || 1;
  const lessons = WEEK_LESSONS[week] || WEEK_LESSONS[1];

  // ── Build prev ──
  let prevRoute;
  if (currentIndex > 0) {
    const prevType = lessons[currentIndex - 1];
    prevRoute = `/week/${week}/${prevType}?i=${currentIndex - 1}`;
  } else {
    // First lesson → go back to week overview
    prevRoute = `/week/${week}`;
  }

  // ── Build next ──
  let nextRoute;
  if (currentIndex < lessons.length - 1) {
    const nextType = lessons[currentIndex + 1];
    nextRoute = `/week/${week}/${nextType}?i=${currentIndex + 1}`;
  } else {
    // Last lesson → either next week or dashboard
    if (week < 8) {
      nextRoute = `/week/${week + 1}`;
    } else {
      nextRoute = "/dashboard";
    }
  }

  return {
    prevRoute,
    nextRoute,
    isFirst: currentIndex === 0,
    isLast: currentIndex === lessons.length - 1,
    totalLessons: lessons.length,
    currentIndex,
    weekNumber: week,
  };
}