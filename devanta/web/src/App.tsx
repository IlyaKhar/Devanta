import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { ParentShell } from "./components/parent/ParentShell";
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
import { AdminShell } from "./components/admin/AdminShell";
import { AdminDashboardPage } from "./pages/AdminDashboard";
import { AdminUsersPage } from "./pages/AdminUsers";
import { AdminModerationPage } from "./pages/AdminModeration";
import { AdminFaqPage } from "./pages/AdminFaq";
import { SettingsPage } from "./pages/Settings";
import { ParentConnectPage } from "./pages/ParentConnect";
import { ParentDashboardPage } from "./pages/ParentDashboard";
import { ParentStudentPage } from "./pages/ParentStudent";
import { ParentLinkPastePage } from "./pages/ParentLinkPaste";
import { api } from "./services/api";
import { useAuthStore } from "./store/auth";

function GuestOnlyRoute({ children }: { children: JSX.Element }) {
  const [searchParams] = useSearchParams();
  const isAuthed = Boolean(useAuthStore((s) => s.accessToken));
  const role = useAuthStore((s) => s.role);
  const next = searchParams.get("next");
  if (isAuthed) {
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return <Navigate to={next} replace />;
    }
    const staff = role === "admin" || role === "moderator";
    return <Navigate to={role === "parent" ? "/parent" : staff ? "/admin" : "/dashboard"} replace />;
  }
  return children;
}

/** ЛК ученика: JWT + не родитель. */
function StudentProtectedShell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role === "parent") {
    return <Navigate to="/parent" replace />;
  }
  return <DashboardLayout />;
}

/** Оболочка родителя + проверка роли. */
function ParentProtectedShell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();
  if (!accessToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (role !== "parent") {
    return <Navigate to="/dashboard" replace />;
  }
  return <ParentShell />;
}

export function App() {
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

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnlyRoute>
            <RegisterPage />
          </GuestOnlyRoute>
        }
      />
      <Route element={<StudentProtectedShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/modules" element={<ModulesPage />} />
        <Route path="/module/:id" element={<ModuleCoursePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/lesson/:id" element={<LessonPage />} />
        <Route path="/task/:id" element={<TaskPage />} />
        <Route path="/quiz/:moduleId" element={<QuizPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/parent" element={<ParentProtectedShell />}>
        <Route index element={<ParentDashboardPage />} />
        <Route path="student/:studentId" element={<ParentStudentPage />} />
      </Route>
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/parent/connect" element={<ParentConnectPage />} />
      <Route path="/parent/link" element={<ParentLinkPastePage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="faq" element={<AdminFaqPage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
