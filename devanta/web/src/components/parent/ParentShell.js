import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";
/** Минимальная оболочка ЛК родителя (без сайдбара курсов). */
export function ParentShell() {
    const logout = useAuthStore((s) => s.logout);
    async function handleLogout() {
        try {
            await api.post("/auth/logout");
        }
        catch {
            /* нет cookie — ок */
        }
        logout();
        window.location.href = "/";
    }
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 dark:bg-slate-950", children: [_jsx("header", { className: "border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900", children: _jsxs("div", { className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3", children: [_jsx(Link, { to: "/parent", className: "text-lg font-black text-brand-600 dark:text-brand-400", children: "Devanta \u00B7 \u0420\u043E\u0434\u0438\u0442\u0435\u043B\u044C" }), _jsxs("nav", { className: "flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200", children: [_jsx(Link, { to: "/parent", className: "hover:text-brand-600 dark:hover:text-brand-400", children: "\u041C\u043E\u0438 \u0434\u0435\u0442\u0438" }), _jsx(Link, { to: "/parent/link", className: "hover:text-brand-600 dark:hover:text-brand-400", children: "\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443" }), _jsx("button", { type: "button", onClick: () => void handleLogout(), className: "rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800", children: "\u0412\u044B\u0439\u0442\u0438" })] })] }) }), _jsx("main", { className: "mx-auto max-w-5xl px-4 py-6", children: _jsx(Outlet, {}) })] }));
}
