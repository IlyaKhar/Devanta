import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
function difficultyBadgeClass(level) {
    if (level === "Легко")
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30";
    if (level === "Средне")
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30";
    return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30";
}
export function TasksPage() {
    const [filter, setFilter] = useState("Все");
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [specialChallenges, setSpecialChallenges] = useState([]);
    const [isLoadingSpecial, setIsLoadingSpecial] = useState(false);
    useEffect(() => {
        let cancelled = false;
        setIsLoadingSpecial(true);
        api
            .get("/tasks/special")
            .then(({ data }) => {
            if (!cancelled)
                setSpecialChallenges(data);
        })
            .catch(() => {
            if (!cancelled)
                setSpecialChallenges([]);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoadingSpecial(false);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        let cancelled = false;
        setIsLoadingTasks(true);
        const difficultyMap = {
            Все: "all",
            Легко: "easy",
            Средне: "medium",
            Сложно: "hard",
        };
        api
            .get(`/tasks?difficulty=${difficultyMap[filter]}`)
            .then(({ data }) => {
            if (!cancelled)
                setTasks(data);
        })
            .catch(() => {
            if (!cancelled)
                setTasks([]);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoadingTasks(false);
        });
        return () => {
            cancelled = true;
        };
    }, [filter]);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-8", children: [_jsxs("section", { children: [_jsxs("h1", { className: "flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white", children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFC6" }), "\u0417\u0430\u0434\u0430\u0447\u0438 \u0438 \u0447\u0435\u043B\u043B\u0435\u043D\u0434\u0436\u0438"] }), _jsx("p", { className: "mt-2 text-slate-600 dark:text-slate-400", children: "\u041F\u0440\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u0439 \u0441\u0432\u043E\u0438 \u043D\u0430\u0432\u044B\u043A\u0438, \u0440\u0435\u0448\u0430\u044F \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u044F" })] }), _jsxs("section", { className: "space-y-4", "aria-labelledby": "special-tasks", children: [_jsxs("h2", { id: "special-tasks", className: "flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white", children: [_jsx("span", { "aria-hidden": true, children: "\u26A1" }), "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438"] }), _jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [isLoadingSpecial ? (_jsx("div", { className: "col-span-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0441\u043F\u0435\u0446\u0437\u0430\u0434\u0430\u0447\u0438..." })) : null, specialChallenges.map((challenge) => (_jsxs("article", { className: "rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/5", children: [_jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900 dark:text-white", children: challenge.title }), _jsxs("span", { className: "rounded-full bg-brand-500 px-2 py-1 text-xs font-semibold text-white", children: ["+", challenge.rewardXp, " XP"] })] }), _jsx("p", { className: "mb-4 text-sm text-slate-600 dark:text-slate-400", children: challenge.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400", children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDD52" }), challenge.duration] }), _jsx("button", { type: "button", className: "rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600", children: "\u041D\u0430\u0447\u0430\u0442\u044C" })] })] }, challenge.id)))] })] }), _jsxs("section", { className: "space-y-4", "aria-labelledby": "all-tasks", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsx("h2", { id: "all-tasks", className: "text-2xl font-bold text-slate-900 dark:text-white", children: "\u0412\u0441\u0435 \u0437\u0430\u0434\u0430\u0447\u0438" }), _jsx("div", { className: "flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800", children: ["Все", "Легко", "Средне", "Сложно"].map((item) => (_jsx("button", { type: "button", onClick: () => setFilter(item), className: `rounded-full px-3 py-1.5 text-sm font-semibold transition ${filter === item
                                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`, children: item }, item))) })] }), _jsxs("div", { className: "space-y-4", children: [isLoadingTasks ? (_jsx("div", { className: "rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0437\u0430\u0434\u0430\u0447\u0438..." })) : null, tasks.map((task) => (_jsxs("article", { className: `rounded-2xl border p-4 shadow-sm transition md:p-5 ${task.completed
                                    ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`, children: [_jsxs("div", { className: "mb-3 flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-slate-900 dark:text-white", children: task.title }), _jsx("p", { className: "mt-1 text-sm text-slate-600 dark:text-slate-400", children: task.description })] }), _jsx("span", { className: `shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyBadgeClass(task.difficulty)}`, children: task.difficulty })] }), _jsxs("div", { className: "mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400", children: [_jsx("span", { className: "rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200", children: task.category }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFC6" }), task.xp, " XP"] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDD52" }), task.time] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFAE" }), task.solves, " \u0440\u0435\u0448\u0435\u043D\u0438\u0439"] })] }), _jsx(Link, { to: `/task/${task.id}`, className: "inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600", children: task.completed ? "Решить снова" : "Решить задачу" })] }, task.id))), !isLoadingTasks && tasks.length === 0 ? (_jsx("div", { className: "rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u0434\u0430\u0447 \u0434\u043B\u044F \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u0444\u0438\u043B\u044C\u0442\u0440\u0430." })) : null] })] })] }));
}
