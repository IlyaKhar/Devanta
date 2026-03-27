import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api";
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
export function ParentConnectPage() {
    const location = useLocation();
    const token = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);
    const [data, setData] = useState(null);
    const [parentEmail, setParentEmail] = useState("");
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!token) {
            setNotice("В ссылке нет токена подключения.");
            return;
        }
        let cancelled = false;
        setIsLoading(true);
        setNotice(null);
        api
            .get(`/parent/connect?token=${encodeURIComponent(token)}`)
            .then(({ data }) => {
            if (!cancelled)
                setData(data);
        })
            .catch(() => {
            if (!cancelled)
                setNotice("Ссылка недействительна или истекла.");
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [token]);
    async function submit() {
        setNotice(null);
        if (!token) {
            setNotice("В ссылке нет токена подключения.");
            return;
        }
        if (!isValidEmail(parentEmail)) {
            setNotice("Введите корректный email родителя.");
            return;
        }
        setIsSubmitting(true);
        try {
            const { data } = await api.get(`/parent/connect?token=${encodeURIComponent(token)}&parent=${encodeURIComponent(parentEmail.trim())}`);
            setData(data);
            setNotice("Готово! Родитель подключен.");
            setParentEmail("");
        }
        catch {
            setNotice("Не удалось подтвердить подключение. Попробуйте позже.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950", children: _jsxs("div", { className: "w-full max-w-xl space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400", children: "\u2190 Devanta" }), _jsx("span", { className: "text-xs text-slate-500 dark:text-slate-400", children: "\u0420\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white", children: "\uD83D\uDEE1" }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F" }), _jsx("p", { className: "mt-1 text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435, \u0447\u0442\u043E\u0431\u044B \u0432\u0438\u0434\u0435\u0442\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0443\u0447\u0435\u043D\u0438\u043A\u0430." })] })] }), isLoading ? (_jsx("div", { className: "mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300", children: "\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u0441\u044B\u043B\u043A\u0443..." })) : null, data ? (_jsxs("div", { className: "mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200", children: ["\u0423\u0447\u0435\u043D\u0438\u043A: ", _jsx("b", { children: data.studentName })] })) : null, notice ? (_jsx("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300", children: notice })) : null, _jsxs("div", { className: "mt-5 grid gap-2", children: [_jsx("label", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: "Email \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F" }), _jsx("input", { value: parentEmail, onChange: (e) => setParentEmail(e.target.value), placeholder: "parent@example.com", inputMode: "email", className: "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-white" }), _jsx("button", { type: "button", disabled: !token || !data || isSubmitting, onClick: submit, className: "mt-2 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50", children: isSubmitting ? "Подключаю..." : "Подтвердить подключение" })] }), _jsx("p", { className: "mt-4 text-xs text-slate-500 dark:text-slate-400", children: "\u041D\u0430\u0436\u0438\u043C\u0430\u044F \u00AB\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C\u00BB, \u0432\u044B \u0441\u043E\u0433\u043B\u0430\u0448\u0430\u0435\u0442\u0435\u0441\u044C \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043E \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u0432 \u0440\u0430\u043C\u043A\u0430\u0445 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0433\u043E \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F." })] })] }) }));
}
