import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mediaUrl } from "../lib/mediaUrl";
import { api } from "../services/api";
export function ParentStudentPage() {
    const { studentId } = useParams();
    const [data, setData] = useState(null);
    const [err, setErr] = useState(null);
    useEffect(() => {
        if (!studentId)
            return;
        let c = false;
        api
            .get(`/parent/child/${studentId}/progress`)
            .then(({ data: d }) => {
            if (!c)
                setData(d);
        })
            .catch(() => {
            if (!c)
                setErr("Нет доступа или ученик не найден.");
        });
        return () => {
            c = true;
        };
    }, [studentId]);
    const s = data?.summary;
    if (err) {
        return (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-red-600", children: err }), _jsx(Link, { to: "/parent", className: "text-brand-600 underline dark:text-brand-400", children: "\u2190 \u041A \u0441\u043F\u0438\u0441\u043A\u0443" })] }));
    }
    if (!s) {
        return _jsx("p", { className: "text-slate-600 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-wrap items-center gap-4", children: _jsx(Link, { to: "/parent", className: "text-sm font-semibold text-brand-600 dark:text-brand-400", children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }) }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [s.avatarUrl?.trim() ? (_jsx("img", { src: mediaUrl(s.avatarUrl), alt: "", className: "h-20 w-20 rounded-full object-cover" })) : (_jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white", children: (s.fullName || s.username)[0] ?? "?" })), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-slate-900 dark:text-white", children: s.fullName || s.username }), _jsxs("p", { className: "text-slate-500 dark:text-slate-400", children: ["@", s.username] })] })] }), _jsxs("div", { className: "mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80", children: [_jsx("p", { className: "text-xs text-slate-500", children: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: s.level })] }), _jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80", children: [_jsx("p", { className: "text-xs text-slate-500", children: "XP" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: s.xp })] }), _jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80", children: [_jsx("p", { className: "text-xs text-slate-500", children: "\u0423\u0440\u043E\u043A\u0438" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: s.lessonsCompleted })] }), _jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80", children: [_jsx("p", { className: "text-xs text-slate-500", children: "\u0417\u0430\u0434\u0430\u0447\u0438" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: s.tasksSolved })] }), _jsxs("div", { className: "rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80", children: [_jsx("p", { className: "text-xs text-slate-500", children: "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-lg font-bold text-slate-900 dark:text-white", children: s.achievements })] })] })] }), data.activity.length > 0 ? (_jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900", children: [_jsx("h2", { className: "text-lg font-bold text-slate-900 dark:text-white", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" }), _jsx("ul", { className: "mt-3 space-y-2", children: data.activity.map((ev, i) => (_jsxs("li", { className: "flex justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60", children: [_jsx("span", { children: ev.title }), _jsx("span", { className: "shrink-0 text-xs text-slate-500", children: ev.time })] }, `${ev.time}-${i}`))) })] })) : null] }));
}
