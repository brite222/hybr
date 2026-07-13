import { useEffect, useState } from "react";
import api from "../api/axios";
import { CURRICULUM } from "../data/curriculum";

/**
 * Calculates a student's progress percentage for a given week.
 * Uses the same /program endpoint as the Course Overview page.
 */
export function useWeekProgress(weekNumber) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get("/program");
        const weekFromProgram = res.data?.weeks?.find(
          w => w.weekNumber === Number(weekNumber)
        );
        const completedIds = weekFromProgram?.completedLessonIds || [];

        const week = CURRICULUM[weekNumber];
        const totalLessons = week?.lessons?.length || 0;

        if (totalLessons === 0) {
          setProgress(0);
        } else {
          setProgress(Math.round((completedIds.length / totalLessons) * 100));
        }
      } catch (err) {
        console.error("Failed to fetch week progress:", err);
        setProgress(0);
      } finally {
        setLoading(false);
      }
    };

    if (weekNumber) fetchProgress();
  }, [weekNumber]);

  return { progress, loading };
}