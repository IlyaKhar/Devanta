import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
export function ParentDashboardPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    useEffect(() => {
        let c = false;
        setLoading(true);
        api
            .get("/parent/children")
            .then(({ data }) => {
            if (!c)
                setItems(Array.isArray(data.items) ? data.items : []);
        })
            .catch(() => {
            if (!c)
                setErr("Не удалось загрузить список.");
        })
            .finally(() => {
            if (!c)
                setLoading(false);
        });
        return () => {
            c = true;
        };
    }, []);
    if (loading) {
        return _jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" });
    }
    if (err) {
        return _jsx("p", { className: "text-red-600", children: err });
    }
    if (items.length === 0) {
        return (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900", children: [_jsx("h1", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "\u041F\u043E\u043A\u0430 \u043D\u0438\u043A\u043E\u0433\u043E \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043B\u0438" }), _jsxs("p", { className: "mt-2 text-slate-600 dark:text-slate-400", children: ["\u041F\u043E\u043F\u0440\u043E\u0441\u0438 \u0440\u0435\u0431\u0451\u043D\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0438\u0437 \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0438\u043B\u0438 \u0432\u0441\u0442\u0430\u0432\u044C \u0435\u0451 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435", " ", _jsx(Link, { to: "/parent/link", className: "font-semibold text-brand-600 underline dark:text-brand-400", children: "\u00AB\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443\u00BB" }), "."] })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "\u0414\u0435\u0442\u0438" }), _jsx("ul", { className: "grid gap-3 sm:grid-cols-2", children: items.map((ch) => (_jsx("li", { children: _jsxs(Link, { to: `/parent/student/${ch.studentUserId}`, className: "flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700", children: [_jsx("span", { className: "text-lg font-bold text-slate-900 dark:text-white", children: ch.studentName }), _jsxs("span", { className: "mt-1 text-xs text-slate-500", children: ["\u0421\u0432\u044F\u0437\u044C \u0441 ", new Date(ch.connectedAt).toLocaleString()] }), _jsx("span", { className: "mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400", children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u2192" })] }) }, ch.studentUserId))) })] }));
}
