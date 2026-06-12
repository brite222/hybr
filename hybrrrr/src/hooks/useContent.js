import { useEffect, useState } from "react";
import api from "../api/axios";

export function useContent(weekNumber, lessonId) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!weekNumber || !lessonId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/content/${weekNumber}/${lessonId}`);
        setContent(res.data.content);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [weekNumber, lessonId]);

  return { content, loading, error };
}

/**
 * Convert any media path to a full URL
 */
export function getMediaUrl(path) {
  if (!path) return null;
  
  // Full URL already
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Backend path
  const API_BASE = "http://localhost:5000";
  
  if (path.startsWith("/api/")) {
    return `${API_BASE}${path}`;
  }
  
  // Public folder path
  if (path.startsWith("/")) {
    return path;
  }
  
  return path;
}