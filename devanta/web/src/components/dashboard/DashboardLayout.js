import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
function LogoMark({ className = "" }) {
    return (_jsx("div", { className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-sm ${className}`, "aria-hidden": true, children: "</>" }));
}
/** Оболочка личного кабинета: боковая навигация + контент (макет «Главная» и др.). */
export function DashboardLayout() {
    const navigate = useNavigate();
    const clearToken = useAuthStore((s) => s.logout);
    const [xp, setXp] = useState(null);
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    const [logoutLoading, setLogoutLoading] = useState(false);
    const avatarLetter = "У";
    useEffect(() => {
        let cancelled = false;
        api
            .get("/progress")
            .then(({ data }) => {
            if (!cancelled)
                setXp(data.xp);
        })
            .catch(() => {
            if (!cancelled)
                setXp(null);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);
    async function handleLogout() {
        setLogoutLoading(true);
        try {
            await api.post("/auth/logout");
        }
        finally {
            clearToken();
            navigate("/login", { replace: true });
            setLogoutLoading(false);
        }
    }
    const navClass = ({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;
    return (_jsxs("div", { className: "flex min-h-screen bg-[#F4F4F5] text-slate-800 dark:bg-slate-950 dark:text-slate-100", children: [_jsxs("aside", { className: "sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900", children: [_jsxs("div", { className: "mb-8 flex items-center gap-2 px-1", children: [_jsx(LogoMark, {}), _jsx("span", { className: "text-lg font-semibold text-brand-600 dark:text-brand-400", children: "Devanta" })] }), _jsxs("nav", { className: "flex flex-1 flex-col gap-1", "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0435 \u043C\u0435\u043D\u044E", children: [_jsxs(NavLink, { to: "/dashboard", end: true, className: navClass, children: [_jsx("span", { className: "text-lg", "aria-hidden": true, children: "\u2302" }), "\u0413\u043B\u0430\u0432\u043D\u0430\u044F"] }), _jsxs(NavLink, { to: "/modules", className: navClass, children: [_jsx("span", { className: "text-lg", "aria-hidden": true, children: "\uD83D\uDCDA" }), "\u041C\u043E\u0434\u0443\u043B\u0438"] }), _jsxs(NavLink, { to: "/tasks", className: navClass, children: [_jsx("span", { className: "text-lg", "aria-hidden": true, children: "\uD83C\uDFC6" }), "\u0417\u0430\u0434\u0430\u0447\u0438"] }), _jsxs(NavLink, { to: "/leaderboard", className: navClass, children: [_jsx("span", { className: "text-lg", "aria-hidden": true, children: "\uD83D\uDC65" }), "\u0420\u0435\u0439\u0442\u0438\u043D\u0433"] })] }), _jsxs("div", { className: "mt-auto space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800", children: [_jsxs("button", { type: "button", className: "flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600", children: [_jsx("span", { "aria-hidden": true, children: "\u2726" }), "AI \u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442"] }), _jsx("button", { type: "button", onClick: handleLogout, disabled: logoutLoading, className: "w-full rounded-lg px-2 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-slate-200", children: logoutLoading ? "Выходим…" : "Выйти" })] })] }), _jsxs("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col", children: [_jsxs("header", { className: "sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90", children: [_jsx("button", { type: "button", onClick: () => setDark((d) => !d), className: "flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800", "aria-label": dark ? "Светлая тема" : "Тёмная тема", children: dark ? "☀️" : "🌙" }), _jsxs("div", { className: "flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200", children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFC6" }), xp != null ? `${xp} XP` : "… XP"] }), _jsx("button", { type: "button", onClick: () => navigate("/profile"), className: "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-inner transition hover:scale-105", "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442", children: avatarLetter }), _jsx("button", { type: "button", onClick: () => navigate("/settings"), className: "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800", "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: "\u2699\uFE0F" })] }), _jsx("main", { className: "flex-1 overflow-auto p-6 lg:p-8", children: _jsx(Outlet, {}) })] })] }));
}
