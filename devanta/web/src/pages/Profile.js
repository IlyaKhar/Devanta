import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
export function ProfilePage() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [activity, setActivity] = useState([]);
    const [achievementItems, setAchievementItems] = useState([]);
    const [tab, setTab] = useState("overview");
    const [inviteNotice, setInviteNotice] = useState(null);
    const [inviteLink, setInviteLink] = useState("");
    const [isInviteLoading, setIsInviteLoading] = useState(false);
    const [parentContact, setParentContact] = useState("");
    const [isConnectingParent, setIsConnectingParent] = useState(false);
    const xp = summary?.xp ?? 0;
    const currentLevel = summary?.level ?? 0;
    const nextLevelXP = Math.max(100, (currentLevel + 1) * 100);
    const progressPercent = Math.min(100, Math.round((xp / nextLevelXP) * 100));
    const fallbackInviteLink = `${window.location.origin}/parent/connect?student=alex_codes`;
    const actualInviteLink = inviteLink || fallbackInviteLink;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(actualInviteLink)}`;
    useEffect(() => {
        let cancelled = false;
        api
            .get("/me/summary")
            .then(({ data }) => {
            if (!cancelled)
                setSummary(data);
        })
            .catch(() => undefined);
        api
            .get("/me/activity")
            .then(({ data }) => {
            if (!cancelled)
                setActivity(Array.isArray(data) ? data : []);
        })
            .catch(() => {
            if (!cancelled)
                setActivity([]);
        });
        api
            .get("/me/achievements")
            .then(({ data }) => {
            if (!cancelled)
                setAchievementItems(Array.isArray(data) ? data : []);
        })
            .catch(() => {
            if (!cancelled)
                setAchievementItems([]);
        });
        return () => {
            cancelled = true;
        };
    }, []);
    useEffect(() => {
        if (tab !== "parent" || inviteLink || isInviteLoading)
            return;
        setIsInviteLoading(true);
        api
            .get("/parent/invite")
            .then(({ data }) => {
            if (data.inviteLink)
                setInviteLink(data.inviteLink);
        })
            .catch(() => {
            setInviteNotice("Не удалось получить защищенную ссылку, использую базовую.");
        })
            .finally(() => setIsInviteLoading(false));
    }, [tab, inviteLink, isInviteLoading]);
    async function copyInviteLink() {
        try {
            await navigator.clipboard.writeText(actualInviteLink);
            setInviteNotice("Ссылка скопирована.");
        }
        catch {
            setInviteNotice("Не удалось скопировать ссылку.");
        }
    }
    async function shareInviteLink() {
        if (!navigator.share) {
            setInviteNotice("Поделиться можно через копирование ссылки.");
            return;
        }
        try {
            await navigator.share({
                title: "Devanta — подключение родителя",
                text: "Подключись к прогрессу ученика в Devanta",
                url: actualInviteLink,
            });
            setInviteNotice("Ссылка отправлена.");
        }
        catch {
            setInviteNotice("Не удалось открыть меню поделиться.");
        }
    }
    async function connectParent() {
        if (!inviteLink) {
            setInviteNotice("Сначала дождись генерации защищенной ссылки.");
            return;
        }
        const token = new URL(inviteLink).searchParams.get("token") ?? "";
        if (!token) {
            setInviteNotice("В ссылке нет токена подключения.");
            return;
        }
        if (!parentContact.trim()) {
            setInviteNotice("Укажи email или контакт родителя.");
            return;
        }
        setIsConnectingParent(true);
        try {
            await api.get(`/parent/connect?token=${encodeURIComponent(token)}&parent=${encodeURIComponent(parentContact.trim())}`);
            setInviteNotice("Родитель успешно подключен.");
            setParentContact("");
        }
        catch {
            setInviteNotice("Не удалось подключить родителя.");
        }
        finally {
            setIsConnectingParent(false);
        }
    }
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-4", children: [_jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setTab("overview"), className: `rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${tab === "overview"
                            ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
                            : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"}`, children: "\uD83D\uDCCA \u041E\u0431\u0437\u043E\u0440 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F" }), _jsx("button", { type: "button", onClick: () => setTab("parent"), className: `rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${tab === "parent"
                            ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
                            : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"}`, children: "\uD83D\uDEE1 \u0420\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { className: "grid gap-5 xl:grid-cols-[320px_1fr]", children: [_jsxs("section", { className: "space-y-4", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("div", { className: "mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-4xl", children: "\uD83E\uDDD1\u200D\uD83D\uDCBB" }), _jsx("h1", { className: "text-center text-2xl font-bold text-slate-900 dark:text-white", children: summary?.fullName?.trim() || "Ученик" }), _jsxs("p", { className: "mt-1 text-center text-sm text-slate-500 dark:text-slate-400", children: ["@", summary?.username?.trim() || "user"] }), _jsx("div", { className: "mt-4 flex justify-center", children: _jsxs("span", { className: "rounded-lg bg-brand-500 px-3 py-1 text-sm font-semibold text-white", children: ["\u0423\u0440\u043E\u0432\u0435\u043D\u044C ", currentLevel] }) }), _jsxs("div", { className: "mt-4", children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-slate-500 dark:text-slate-400", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0443\u0440\u043E\u0432\u043D\u044F" }), _jsxs("span", { className: "font-semibold text-brand-600 dark:text-brand-400", children: [xp, "/", nextLevelXP, " XP"] })] }), _jsx("div", { className: "h-2 rounded-full bg-slate-200 dark:bg-slate-700", children: _jsx("div", { className: "h-2 rounded-full bg-brand-500 transition-all", style: { width: `${progressPercent}%` } }) }), _jsxs("p", { className: "mt-2 text-xs text-slate-500 dark:text-slate-400", children: [Math.max(0, nextLevelXP - xp), " XP \u0434\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F"] })] }), _jsx("button", { type: "button", onClick: () => navigate("/settings"), className: "mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800", children: "\u2699\uFE0F \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0440\u043E\u0444\u0438\u043B\u044F" })] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h2", { className: "mb-3 text-xl font-bold text-slate-900 dark:text-white", children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "flex justify-between text-slate-600 dark:text-slate-300", children: [_jsx("span", { children: "\uD83D\uDCD8 \u0423\u0440\u043E\u043A\u043E\u0432 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E" }), _jsx("b", { children: summary?.lessonsCompleted ?? 0 })] }), _jsxs("li", { className: "flex justify-between text-slate-600 dark:text-slate-300", children: [_jsx("span", { children: "\uD83E\uDDE9 \u0417\u0430\u0434\u0430\u0447 \u0440\u0435\u0448\u0435\u043D\u043E" }), _jsx("b", { children: summary?.tasksSolved ?? 0 })] }), _jsxs("li", { className: "flex justify-between text-slate-600 dark:text-slate-300", children: [_jsx("span", { children: "\uD83C\uDFAF \u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439" }), _jsx("b", { children: summary?.achievements ?? 0 })] }), _jsxs("li", { className: "flex justify-between text-slate-600 dark:text-slate-300", children: [_jsx("span", { children: "\uD83D\uDCC8 \u0412\u0441\u0435\u0433\u043E XP" }), _jsx("b", { children: xp })] })] })] })] }), tab === "overview" ? (_jsxs("section", { className: "space-y-4", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h2", { className: "mb-3 text-xl font-bold text-slate-900 dark:text-white", children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C" }), activity.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438." })) : (_jsx("ul", { className: "space-y-2", children: activity.map((event) => (_jsxs("li", { className: "flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-slate-900 dark:text-white", children: event.title }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: event.time })] }), _jsx("span", { className: "rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300", children: event.xp })] }, `${event.title}-${event.time}-${event.xp}`))) }))] }), _jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h2", { className: "text-xl font-bold text-slate-900 dark:text-white", children: "\u0422\u0432\u043E\u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F" }), _jsxs("p", { className: "mb-4 text-sm text-slate-500 dark:text-slate-400", children: ["\u041F\u043E\u043B\u0443\u0447\u0435\u043D\u043E: ", summary?.achievements ?? 0] }), achievementItems.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442." })) : (_jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: achievementItems.map((item) => (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900", children: [_jsx("p", { className: "text-sm font-semibold text-slate-900 dark:text-white", children: item.title }), _jsx("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400", children: item.date }), _jsx("div", { className: "mt-2 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300", children: item.code })] }, item.code + item.date))) }))] })] })) : (_jsx("section", { className: "space-y-4", children: _jsxs("article", { className: "rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/5", children: [_jsx("h2", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439" }), _jsx("p", { className: "mt-1 text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u0440\u0438\u0433\u043B\u0430\u0441\u0438 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439, \u0447\u0442\u043E\u0431\u044B \u043E\u043D\u0438 \u043C\u043E\u0433\u043B\u0438 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0442\u0432\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441" }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx("button", { type: "button", onClick: copyInviteLink, className: "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800", children: "\uD83D\uDCCB \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443" }), _jsx("button", { type: "button", onClick: shareInviteLink, className: "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800", children: "\uD83D\uDD17 \u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F" })] }), _jsx("div", { className: "mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: isInviteLoading ? "Генерирую защищенную ссылку..." : actualInviteLink }), inviteNotice ? (_jsx("p", { className: "mt-2 text-sm font-medium text-brand-600 dark:text-brand-400", children: inviteNotice })) : null, _jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [_jsx("input", { value: parentContact, onChange: (e) => setParentContact(e.target.value), placeholder: "Email \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F \u0434\u043B\u044F \u043F\u0440\u0438\u043D\u044F\u0442\u0438\u044F", className: "min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" }), _jsx("button", { type: "button", onClick: connectParent, disabled: isConnectingParent, className: "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200", children: isConnectingParent ? "Подключаю..." : "Подтвердить подключение" })] }), _jsx("div", { className: "mt-4 inline-flex rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900", children: _jsx("img", { src: qrImageUrl, alt: "QR-\u043A\u043E\u0434 \u0434\u043B\u044F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F", className: "h-56 w-56 rounded-xl object-contain" }) })] }) }))] })] }));
}
