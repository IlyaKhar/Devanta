import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function GuestOnlyRoute({ isAuthed, children }) {
    if (isAuthed)
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    return children;
}
/** ЛК с сайдбаром: только для авторизованных. */
function ProtectedShell() {
    const accessToken = useAuthStore((s) => s.accessToken);
    if (!accessToken)
        return _jsx(Navigate, { to: "/login", replace: true });
    return _jsx(DashboardLayout, {});
}
export function App() {
    const accessToken = useAuthStore((s) => s.accessToken);
    const setToken = useAuthStore((s) => s.setToken);
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        let cancelled = false;
        api
            .post("/auth/refresh")
            .then(({ data }) => {
            if (!cancelled)
                setToken(data.accessToken);
        })
            .catch(() => {
            if (!cancelled)
                setToken("");
        })
            .finally(() => {
            if (!cancelled)
                setIsReady(true);
        });
        return () => {
            cancelled = true;
        };
    }, [setToken]);
    if (!isReady)
        return _jsx("div", { className: "flex min-h-screen items-center justify-center text-slate-500", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" });
    const isAuthed = Boolean(accessToken);
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/login", element: _jsx(GuestOnlyRoute, { isAuthed: isAuthed, children: _jsx(LoginPage, {}) }) }), _jsx(Route, { path: "/register", element: _jsx(GuestOnlyRoute, { isAuthed: isAuthed, children: _jsx(RegisterPage, {}) }) }), _jsxs(Route, { element: _jsx(ProtectedShell, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "/modules", element: _jsx(ModulesPage, {}) }), _jsx(Route, { path: "/module/:id", element: _jsx(ModuleCoursePage, {}) }), _jsx(Route, { path: "/tasks", element: _jsx(TasksPage, {}) }), _jsx(Route, { path: "/leaderboard", element: _jsx(LeaderboardPage, {}) }), _jsx(Route, { path: "/lesson/:id", element: _jsx(LessonPage, {}) }), _jsx(Route, { path: "/task/:id", element: _jsx(TaskPage, {}) }), _jsx(Route, { path: "/quiz/:moduleId", element: _jsx(QuizPage, {}) }), _jsx(Route, { path: "/admin/faq", element: _jsx(AdminFaqPage, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) })] }), _jsx(Route, { path: "/reviews", element: _jsx(ReviewsPage, {}) }), _jsx(Route, { path: "/parent/connect", element: _jsx(ParentConnectPage, {}) }), _jsx(Route, { path: "/faq", element: _jsx(FaqPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }));
}
