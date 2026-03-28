import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
// PNG для страницы «Рейтинг» (src/public/UI/Rating)
const ratingUi = {
    header: new URL("../public/UI/Rating/Rating.png", import.meta.url).href,
    tabTotal: new URL("../public/UI/Rating/SummaryRating.png", import.meta.url).href,
    tabWeek: new URL("../public/UI/Rating/WeeklyRating.png", import.meta.url).href,
    firstPlace: new URL("../public/UI/Rating/FirstPlace.png", import.meta.url).href,
    secondPlace: new URL("../public/UI/Rating/SecondPlace.png", import.meta.url).href,
    thirdPlace: new URL("../public/UI/Rating/ThirdPlace.png", import.meta.url).href,
};
/** Картинка из UI без лишней обводки; alt пустой — декоративные иконки рядом с текстом */
function UiImg({ src, className = "h-5 w-5", alt = "" }) {
    return _jsx("img", { src: src, alt: alt, width: 20, height: 20, className: `shrink-0 object-contain ${className}` });
}
// Порядок колонок как в Figma: 2-е | 1-е | 3-е
const PODIUM_LAYOUT = [
    { place: "second", rankIndex: 1, medalIcon: ratingUi.secondPlace },
    { place: "first", rankIndex: 0, medalIcon: ratingUi.firstPlace },
    { place: "third", rankIndex: 2, medalIcon: ratingUi.thirdPlace },
];
function podiumCardClass(place) {
    switch (place) {
        case "first":
            return "border-amber-400 bg-amber-50/90 dark:border-amber-500/50 dark:bg-amber-950/25 md:min-h-[22rem] md:pb-2";
        case "second":
            return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:min-h-[19rem]";
        case "third":
            return "border-brand-500/70 bg-white dark:border-brand-500/40 dark:bg-slate-900 md:min-h-[19rem]";
        default:
            return "";
    }
}
function levelBadgeClass(place) {
    switch (place) {
        case "first":
            return "bg-brand-500 text-white dark:bg-brand-600";
        case "second":
            return "bg-slate-400 text-white dark:bg-slate-500";
        case "third":
            return "bg-orange-200 text-white dark:bg-orange-400/90 dark:text-white";
        default:
            return "bg-brand-500 text-white";
    }
}
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
            setUsers(data.map((row) => ({
                name: row.name,
                xp: row.xp,
                level: row.level,
                achievements: row.achievements,
                isMe: row.isMe,
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
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [_jsxs("section", { className: "flex gap-3", children: [_jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 p-2 shadow-sm", "aria-hidden": true, children: _jsx(UiImg, { src: ratingUi.header, className: "h-9 w-9", alt: "" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u0420\u0435\u0439\u0442\u0438\u043D\u0433" }), _jsx("p", { className: "mt-1 text-slate-500 dark:text-slate-400", children: "\u0421\u043E\u0440\u0435\u0432\u043D\u0443\u0439\u0441\u044F \u0441 \u0434\u0440\u0443\u0433\u0438\u043C\u0438 \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C\u0438" })] })] }), _jsxs("section", { className: "flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800", children: [_jsxs("button", { type: "button", onClick: () => setTab("total"), className: `flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "total" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`, children: [_jsx(UiImg, { src: ratingUi.tabTotal, className: "h-5 w-5", alt: "" }), "\u041E\u0431\u0449\u0438\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433"] }), _jsxs("button", { type: "button", onClick: () => setTab("week"), className: `flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "week" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`, children: [_jsx(UiImg, { src: ratingUi.tabWeek, className: "h-5 w-5", alt: "" }), "\u0417\u0430 \u043D\u0435\u0434\u0435\u043B\u044E"] })] }), isLoading ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u043C \u0440\u0435\u0439\u0442\u0438\u043D\u0433..." })) : null, !isLoading && displayUsers.length === 0 ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u0430." })) : null, _jsx("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end", children: PODIUM_LAYOUT.map(({ place, rankIndex, medalIcon }) => {
                    const user = top3[rankIndex];
                    if (!user) {
                        return _jsx("div", { className: "hidden min-h-0 md:block", "aria-hidden": true }, place);
                    }
                    return (_jsxs("article", { className: `flex flex-col rounded-2xl border p-5 text-center shadow-sm ${podiumCardClass(place)}`, children: [_jsx("div", { className: "flex justify-center", children: _jsx(UiImg, { src: medalIcon, className: "h-12 w-12 md:h-14 md:w-14", alt: "" }) }), _jsx("h2", { className: "mt-3 text-2xl font-black text-slate-900 dark:text-white", children: user.name }), _jsx("p", { className: "mt-2 flex justify-center", children: _jsxs("span", { className: `inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${levelBadgeClass(place)}`, children: ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C ", user.level] }) }), _jsxs("p", { className: "mt-4 text-5xl font-black text-brand-600 dark:text-brand-400", children: [user.xp, " XP"] }), _jsxs("p", { className: "mt-2 text-sm text-slate-500 dark:text-slate-400", children: [user.achievements, " \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439"] })] }, `${place}-${user.name}`));
                }) }), _jsx("section", { className: "space-y-3", children: rest.map((user, index) => (_jsxs("article", { className: "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsxs("p", { className: "w-10 shrink-0 text-lg font-bold text-slate-500 dark:text-slate-400", children: ["#", index + 4] }), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "font-bold text-slate-900 dark:text-white", children: [user.name, " ", user.isMe ? (_jsx("span", { className: "ml-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300", children: "\u042D\u0442\u043E \u0442\u044B!" })) : null] }), _jsxs("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C ", user.level, " ", _jsx("span", { className: "mx-1", children: "\u2022" }), " ", user.achievements, " \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439"] })] })] }), _jsxs("div", { className: "shrink-0 text-right", children: [_jsx("p", { className: "text-4xl font-black leading-none text-brand-600 dark:text-brand-400", children: user.xp }), _jsx("p", { className: "mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400", children: "XP" })] })] }, user.name))) })] }));
}
