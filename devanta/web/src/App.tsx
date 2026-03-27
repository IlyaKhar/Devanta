import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { DashboardPage } from "./pages/Dashboard";
import { ProfilePage } from "./pages/Profile";
import { LessonPage } from "./pages/Lesson";
import { TaskPage } from "./pages/Task";
import { QuizPage } from "./pages/Quiz";
import { LeaderboardPage } from "./pages/Leaderboard";
import { ModulesPage } from "./pages/Modules";
import { ModuleCoursePage } from "./pages/ModuleCourse";
import { TasksPage } from "./pages/Tasks";
import { ReviewsPage } from "./pages/Reviews";
import { FaqPage } from "./pages/Faq";
import { AdminFaqPage } from "./pages/AdminFaq";
import { SettingsPage } from "./pages/Settings";
import { ParentConnectPage } from "./pages/ParentConnect";
import { api } from "./services/api";
import { useAuthStore } from "./store/auth";

function GuestOnlyRoute({ isAuthed, children }: { isAuthed: boolean; children: JSX.Element }) {
  if (isAuthed) return <Navigate to="/dashboard" replace />;
  return children;
}

/** ЛК с сайдбаром: только для авторизованных. */
function ProtectedShell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <DashboardLayout />;
}

export function App() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setToken = useAuthStore((s) => s.setToken);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .post<{ accessToken: string }>("/auth/refresh")
      .then(({ data }) => {
        if (!cancelled) setToken(data.accessToken);
      })
      .catch(() => {
        if (!cancelled) setToken("");
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [setToken]);

  if (!isReady)
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Загрузка…</div>;

  const isAuthed = Boolean(accessToken);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <GuestOnlyRoute isAuthed={isAuthed}>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnlyRoute isAuthed={isAuthed}>
            <RegisterPage />
          </GuestOnlyRoute>
        }
      />
      <Route element={<ProtectedShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/module/:id" element={<ModuleCoursePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/task/:id" element={<TaskPage />} />
        <Route path="/quiz/:moduleId" element={<QuizPage />} />
        <Route path="/admin/faq" element={<AdminFaqPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/parent/connect" element={<ParentConnectPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

