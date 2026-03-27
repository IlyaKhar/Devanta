import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
function iconByTitle(title) {
    const lower = title.toLowerCase();
    if (lower.includes("javascript"))
        return "⚡";
    if (lower.includes("python"))
        return "🐍";
    if (lower.includes("golang"))
        return "◆";
    if (lower.includes("веб"))
        return "🌐";
    if (lower.includes("алгоритм"))
        return "🧩";
    if (lower.includes("мобильн"))
        return "📱";
    return "📚";
}
export function DashboardPage() {
    const [summary, setSummary] = useState(null);
    const [modules, setModules] = useState([]);
    useEffect(() => {
        let cancelled = false;
        api
            .get("/me/summary")
            .then(({ data }) => {
            if (!cancelled)
                setSummary(data);
        })
            .catch(() => {
            if (!cancelled)
                setSummary(null);
        });
        api
            .get("/modules?tab=all")
            .then(({ data }) => {
            if (!cancelled)
                setModules(Array.isArray(data) ? data : []);
        })
            .catch(() => {
            if (!cancelled)
                setModules([]);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const name = useMemo(() => summary?.fullName?.trim() || summary?.username?.trim() || "Ученик", [summary]);
    const popularCourses = useMemo(() => modules.slice(0, 6), [modules]);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-8", children: [_jsxs("section", { children: [_jsxs("h1", { className: "text-3xl font-bold tracking-tight text-slate-900 dark:text-white", children: ["\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C, ", name, "! \uD83D\uDC4B"] }), _jsx("p", { className: "mt-2 text-slate-600 dark:text-slate-400", children: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439 \u0443\u0447\u0438\u0442\u044C\u0441\u044F \u0438 \u0434\u0432\u0438\u0433\u0430\u0442\u044C\u0441\u044F \u043A \u0441\u0432\u043E\u0435\u0439 \u0446\u0435\u043B\u0438." })] }), _jsxs("section", { className: "grid gap-4 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C" }), _jsx("p", { className: "mt-1 text-2xl font-bold text-slate-900 dark:text-white", children: summary?.level ?? 0 })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0420\u0435\u0448\u0435\u043D\u043E \u0437\u0430\u0434\u0430\u0447" }), _jsx("p", { className: "mt-1 text-2xl font-bold text-slate-900 dark:text-white", children: summary?.tasksSolved ?? 0 })] }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E XP" }), _jsx("p", { className: "mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400", children: summary?.xp ?? 0 })] })] }), _jsxs("section", { "aria-labelledby": "popular-courses-heading", children: [_jsxs("div", { className: "mb-4 flex items-center justify-between", children: [_jsx("h2", { id: "popular-courses-heading", className: "text-2xl font-bold text-slate-900 dark:text-white", children: "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u043A\u0443\u0440\u0441\u044B" }), _jsx(Link, { to: "/modules", className: "text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400", children: "\u0412\u0441\u0435 \u043A\u0443\u0440\u0441\u044B \u2192" })] }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3", children: popularCourses.map((course) => (_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("p", { className: "text-xl", children: iconByTitle(course.title) }), _jsx("h3", { className: "mt-2 text-lg font-bold text-slate-900 dark:text-white", children: course.title }), _jsxs("p", { className: "mt-2 text-sm text-slate-500 dark:text-slate-400", children: ["\uD83D\uDD50 ", course.durationMonths || "—", " ", course.durationMonths === 1 ? "месяц" : "месяцев"] }), _jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: ["\uD83D\uDCC8 ", course.students || 0, " \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432"] }), _jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800", children: [_jsxs("span", { className: "text-sm text-slate-600 dark:text-slate-400", children: [course.level || "С нуля", " \u00B7 \u2B50 ", course.rating ? course.rating.toFixed(1) : "—"] }), _jsx(Link, { to: `/module/${course.id}`, className: "text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400", children: "\u041D\u0430\u0447\u0430\u0442\u044C \u2192" })] })] }, course.id))) })] })] }));
}
