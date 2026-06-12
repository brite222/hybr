import api from "../api/axios";

/**
 * Award points to the current student for completing a lesson
 * @param {object} params - { lessonId, weekNumber, lessonType, extra }
 */
export async function awardPoints({ lessonId, weekNumber, lessonType, extra = null }) {
  try {
    const res = await api.post("/points/award", {
      lessonId,
      weekNumber,
      lessonType,
      extra,
    });
    return res.data; // { success, pointsEarned, totalPoints, reason }
  } catch (err) {
    console.error("Failed to award points:", err);
    return null;
  }
}