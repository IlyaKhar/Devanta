import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getAxiosErrorMessage } from "../services/api";
export function TaskPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [hintsOpen, setHintsOpen] = useState(false);
    useEffect(() => {
        if (!id)
            return;
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        api
            .get(`/tasks/${id}`)
            .then(({ data }) => {
            if (!cancelled) {
                setTask(data);
                setCode((data.starterCode ?? "").trimEnd() ? data.starterCode ?? "" : "");
            }
        })
            .catch(() => {
            if (!cancelled)
                setTask(null);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);
    async function submit() {
        if (!task || !id)
            return;
        setError(null);
        setIsSubmitting(true);
        try {
            const { data } = await api.post(`/tasks/${id}/submit`, {
                code: code.trim(),
            });
            if (data.accepted) {
                setSuccess(true);
            }
            else {
                setError(data.message ?? "Ответ не принят.");
            }
        }
        catch (err) {
            if (typeof err === "object" && err !== null && "response" in err) {
                const ax = err;
                const m = ax.response?.data?.message;
                if (typeof m === "string" && m.trim()) {
                    setError(m);
                }
                else {
                    setError(getAxiosErrorMessage(err, "Ошибка отправки."));
                }
            }
            else {
                setError(getAxiosErrorMessage(err, "Ошибка отправки."));
            }
        }
        finally {
            setIsSubmitting(false);
        }
    }
    const showEditor = Boolean(task?.needsCodeCheck || task?.type === "code");
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [_jsx("button", { type: "button", onClick: () => navigate(-1), className: "text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200", children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [isLoading ? _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0437\u0430\u0434\u0430\u0447\u0443\u2026" }) : null, !isLoading && !task ? _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0434\u0430\u0447\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430." }) : null, task ? (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: task.title }), _jsx("p", { className: "mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300", children: task.question }), _jsxs("p", { className: "mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400", children: ["\u041D\u0430\u0433\u0440\u0430\u0434\u0430: +", task.xpReward, " XP"] }), task.hints && task.hints.length > 0 ? (_jsxs("div", { className: "mt-4", children: [_jsx("button", { type: "button", onClick: () => setHintsOpen((v) => !v), className: "text-sm font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-400", children: hintsOpen ? "Скрыть подсказки" : `Подсказки (${task.hints.length})` }), hintsOpen ? (_jsx("ol", { className: "mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300", children: task.hints.map((h, i) => (_jsx("li", { children: h }, i))) })) : null] })) : null, showEditor ? (_jsxs("div", { className: "mt-6 space-y-2", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 dark:text-slate-200", children: ["\u041A\u043E\u0434 (", task.language ?? "javascript", ")"] }), _jsx("textarea", { value: code, onChange: (e) => setCode(e.target.value), spellCheck: false, className: "min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-sm text-slate-100 outline-none ring-brand-500/40 focus:ring-2 dark:border-slate-700", placeholder: "// \u0442\u0432\u043E\u0439 \u043A\u043E\u0434" })] })) : (_jsx("p", { className: "mt-6 text-sm text-slate-500 dark:text-slate-400", children: "\u0414\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0430 \u0441\u0435\u0440\u0432\u0435\u0440\u0435 \u043D\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u2014 \u043C\u043E\u0436\u043D\u043E \u0441\u0434\u0430\u0442\u044C \u0431\u0435\u0437 \u043A\u043E\u0434\u0430." })), error ? (_jsx("p", { className: "mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200", children: error })) : null, success ? (_jsxs("div", { className: "mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100", children: [_jsxs("p", { className: "font-semibold", children: ["\u0417\u0430\u0447\u0442\u0435\u043D\u043E! +", task.xpReward, " XP"] }), _jsx(Link, { to: `/lesson/${task.lessonId}`, className: "mt-2 inline-block font-semibold text-brand-700 underline dark:text-brand-300", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0443\u0440\u043E\u043A\u0443 \u2192" })] })) : (_jsx("button", { type: "button", disabled: isSubmitting || (showEditor && !code.trim()), onClick: () => void submit(), className: "mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8", children: isSubmitting ? "Проверяем…" : task.needsCodeCheck ? "Отправить на проверку" : "Сдать задачу" }))] })) : null] })] }));
}
