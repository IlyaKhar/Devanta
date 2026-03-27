import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
const avatars = ["👩‍🎓", "🧑‍💻", "👩‍💻", "👨‍🎓", "👩‍🔬", "🧑‍🔬", "👨‍💻", "🧑‍🎓"];
export function LeaderboardPage() {
    const [tab, setTab] = useState("total");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        api
            .get(`/leaderboard?period=${tab}`)
            .then(({ data }) => {
            if (cancelled)
                return;
            setUsers(data.map((row, index) => ({
                name: row.name,
                xp: row.xp,
                level: row.level,
                achievements: row.achievements,
                isMe: row.isMe,
                avatar: avatars[index % avatars.length] ?? "🧑‍💻",
            })));
        })
            .catch(() => {
            if (!cancelled)
                setUsers([]);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [tab]);
    const displayUsers = useMemo(() => users, [users]);
    const top3 = displayUsers.slice(0, 3);
    const rest = displayUsers.slice(3);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [_jsxs("section", { children: [_jsxs("h1", { className: "flex items-center gap-2 text-4xl font-black text-slate-900 dark:text-white", children: [_jsx("span", { "aria-hidden": true, children: "\uD83C\uDFC6" }), "\u0420\u0435\u0439\u0442\u0438\u043D\u0433"] }), _jsx("p", { className: "mt-1 text-slate-500 dark:text-slate-400", children: "\u0421\u043E\u0440\u0435\u0432\u043D\u0443\u0439\u0441\u044F \u0441 \u0434\u0440\u0443\u0433\u0438\u043C\u0438 \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C\u0438" })] }), _jsxs("section", { className: "flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800", children: [_jsx("button", { type: "button", onClick: () => setTab("total"), className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "total" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`, children: "\uD83C\uDFC6 \u041E\u0431\u0449\u0438\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433" }), _jsx("button", { type: "button", onClick: () => setTab("week"), className: `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "week" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`, children: "\uD83D\uDCC8 \u0417\u0430 \u043D\u0435\u0434\u0435\u043B\u044E" })] }), isLoading ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C \u0440\u0435\u0439\u0442\u0438\u043D\u0433..." })) : null, !isLoading && displayUsers.length === 0 ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0430." })) : null, _jsx("section", { className: "grid gap-4 md:grid-cols-3", children: top3.map((user, index) => (_jsxs("article", { className: `rounded-2xl border bg-white p-5 text-center shadow-sm dark:bg-slate-900 ${index === 0 ? "border-amber-300 dark:border-amber-500/40" : "border-slate-200 dark:border-slate-700"}`, children: [_jsx("p", { className: "text-4xl", children: index === 0 ? "👑" : "🏅" }), _jsx("p", { className: "mt-2 text-4xl", children: user.avatar }), _jsx("h2", { className: "mt-3 text-2xl font-black text-slate-900 dark:text-white", children: user.name }), _jsxs("p", { className: "mt-1 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300", children: ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C ", user.level] }), _jsxs("p", { className: "mt-4 text-5xl font-black text-brand-600 dark:text-brand-400", children: [user.xp, " XP"] }), _jsxs("p", { className: "mt-2 text-sm text-slate-500 dark:text-slate-400", children: [user.achievements, " \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439"] })] }, user.name))) }), _jsx("section", { className: "space-y-3", children: rest.map((user, index) => (_jsxs("article", { className: "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("p", { className: "w-10 text-lg font-bold text-slate-500 dark:text-slate-400", children: ["#", index + 4] }), _jsx("p", { className: "text-2xl", children: user.avatar }), _jsxs("div", { children: [_jsxs("p", { className: "font-bold text-slate-900 dark:text-white", children: [user.name, " ", user.isMe ? _jsx("span", { className: "ml-2 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300", children: "\u042D\u0442\u043E \u0442\u044B!" }) : null] }), _jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C ", user.level, " \u00B7 ", user.achievements, " \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439"] })] })] }), _jsxs("p", { className: "text-right text-4xl font-black text-brand-600 dark:text-brand-400", children: [user.xp, _jsx("span", { className: "ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400", children: "XP" })] })] }, user.name))) })] }));
}
