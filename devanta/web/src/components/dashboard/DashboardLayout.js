import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { mediaUrl } from "../../lib/mediaUrl";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
// UI из src/public/UI (Vite через import.meta.url)
const ui = {
    sideMainA: new URL("../../public/UI/Sidebar/Active/MainLOGOA.png", import.meta.url).href,
    sideMainNa: new URL("../../public/UI/Sidebar/NotActive/MainLogoNA.png", import.meta.url).href,
    sideModulesA: new URL("../../public/UI/Sidebar/Active/ModulesLogoA.png", import.meta.url).href,
    sideModulesNa: new URL("../../public/UI/Sidebar/NotActive/ModulesLogoNA.png", import.meta.url).href,
    sideTasksA: new URL("../../public/UI/Sidebar/Active/TasksLogoA.png", import.meta.url).href,
    sideTasksNa: new URL("../../public/UI/Sidebar/NotActive/TasksLogoNA.png", import.meta.url).href,
    sideRatingA: new URL("../../public/UI/Sidebar/Active/RatingLogoA.png", import.meta.url).href,
    sideRatingNa: new URL("../../public/UI/Sidebar/NotActive/RatingLogoNA.png", import.meta.url).href,
    headerNight: new URL("../../public/UI/Header/NightModeLogo.png", import.meta.url).href,
    headerXp: new URL("../../public/UI/Header/EXPLogo.png", import.meta.url).href,
    headerProfile: new URL("../../public/UI/Header/ProfileLogo.png", import.meta.url).href,
    headerSettings: new URL("../../public/UI/Profile/settings.png", import.meta.url).href,
};
function NavIcon({ src, label }) {
    return _jsx("img", { src: src, alt: "", width: 22, height: 22, className: "h-5 w-5 shrink-0 object-contain", "aria-hidden": true, title: label });
}
function LogoMark({ className = "" }) {
    return (_jsx("div", { className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white ${className}`, "aria-hidden": true, children: "</>" }));
}
/** Оболочка личного кабинета: боковая навигация + контент (макет «Главная» и др.). */
export function DashboardLayout() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const clearToken = useAuthStore((s) => s.logout);
    const [xp, setXp] = useState(null);
    const [headerAvatarUrl, setHeaderAvatarUrl] = useState(null);
    const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
    const [logoutLoading, setLogoutLoading] = useState(false);
    useEffect(() => {
        let cancelled = false;
        api
            .get("/me/summary")
            .then(({ data }) => {
            if (cancelled)
                return;
            setXp(data.xp);
            const u = data.avatarUrl?.trim();
            setHeaderAvatarUrl(u && u.length > 0 ? u : null);
        })
            .catch(() => {
            if (!cancelled) {
                setXp(null);
                setHeaderAvatarUrl(null);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [pathname]);
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
        : "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-900"}`;
    return (_jsxs("div", { className: "flex min-h-screen bg-[#F4F4F5] text-slate-800 dark:bg-black dark:text-neutral-100", children: [_jsxs("aside", { className: "sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 dark:border-neutral-800 dark:bg-neutral-950", children: [_jsxs("div", { className: "mb-8 flex items-center gap-2 px-1", children: [_jsx(LogoMark, {}), _jsx("span", { className: "text-lg font-semibold text-brand-600 dark:text-brand-400", children: "Devanta" })] }), _jsxs("nav", { className: "flex flex-1 flex-col gap-1", "aria-label": "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0435 \u043C\u0435\u043D\u044E", children: [_jsx(NavLink, { to: "/dashboard", end: true, className: navClass, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(NavIcon, { src: isActive ? ui.sideMainA : ui.sideMainNa, label: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F" }), "\u0413\u043B\u0430\u0432\u043D\u0430\u044F"] })) }), _jsx(NavLink, { to: "/modules", className: navClass, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(NavIcon, { src: isActive ? ui.sideModulesA : ui.sideModulesNa, label: "\u041C\u043E\u0434\u0443\u043B\u0438" }), "\u041C\u043E\u0434\u0443\u043B\u0438"] })) }), _jsx(NavLink, { to: "/tasks", className: navClass, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(NavIcon, { src: isActive ? ui.sideTasksA : ui.sideTasksNa, label: "\u0417\u0430\u0434\u0430\u0447\u0438" }), "\u0417\u0430\u0434\u0430\u0447\u0438"] })) }), _jsx(NavLink, { to: "/leaderboard", className: navClass, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(NavIcon, { src: isActive ? ui.sideRatingA : ui.sideRatingNa, label: "\u0420\u0435\u0439\u0442\u0438\u043D\u0433" }), "\u0420\u0435\u0439\u0442\u0438\u043D\u0433"] })) })] }), _jsx("div", { className: "mt-auto border-t border-slate-100 pt-4 dark:border-slate-800", children: _jsx("button", { type: "button", onClick: handleLogout, disabled: logoutLoading, className: "w-full rounded-lg px-2 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60 dark:hover:bg-neutral-900 dark:hover:text-neutral-200", children: logoutLoading ? "Выходим…" : "Выйти" }) })] }), _jsxs("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col", children: [_jsxs("header", { className: "sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur dark:border-neutral-800 dark:bg-black/85", children: [_jsx("button", { type: "button", onClick: () => setDark((d) => !d), className: "flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-900", "aria-label": dark ? "Светлая тема" : "Тёмная тема", children: dark ? (_jsx("span", { className: "text-lg", "aria-hidden": true, children: "\u2600\uFE0F" })) : (_jsx("img", { src: ui.headerNight, alt: "", width: 22, height: 22, className: "h-5 w-5 object-contain" })) }), _jsxs("div", { className: "flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200", children: [_jsx("img", { src: ui.headerXp, alt: "", width: 20, height: 20, className: "h-5 w-5 object-contain", "aria-hidden": true }), xp != null ? `${xp} XP` : "… XP"] }), _jsx("button", { type: "button", onClick: () => navigate("/profile"), className: "flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100 transition hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800", "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442", children: headerAvatarUrl ? (_jsx("img", { src: mediaUrl(headerAvatarUrl), alt: "", width: 40, height: 40, className: "h-full w-full object-cover" }, headerAvatarUrl)) : (_jsx("img", { src: ui.headerProfile, alt: "", width: 24, height: 24, className: "h-6 w-6 object-contain" })) }), _jsx("button", { type: "button", onClick: () => navigate("/settings"), className: "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900", "aria-label": "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: _jsx("img", { src: ui.headerSettings, alt: "", width: 22, height: 22, className: "h-5 w-5 object-contain", "aria-hidden": true }) })] }), _jsx("main", { className: "flex-1 overflow-auto p-6 lg:p-8", children: _jsx(Outlet, {}) })] })] }));
}
