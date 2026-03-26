import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { DashboardPage } from "./pages/Dashboard";
import { LessonPage } from "./pages/Lesson";
import { TaskPage } from "./pages/Task";
import { QuizPage } from "./pages/Quiz";
import { LeaderboardPage } from "./pages/Leaderboard";
import { ReviewsPage } from "./pages/Reviews";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/lesson/:id" element={<LessonPage />} />
      <Route path="/task/:id" element={<TaskPage />} />
      <Route path="/quiz/:moduleId" element={<QuizPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
