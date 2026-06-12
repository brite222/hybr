import { Navigate } from "react-router-dom";

export default function WeekPage() {
  // The old WeekPage is replaced by CourseOverviewPage.
  // Anyone visiting /week/X gets redirected automatically.
  return <Navigate to="/courses/overview" replace />;
}