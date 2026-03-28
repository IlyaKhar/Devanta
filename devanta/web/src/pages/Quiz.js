import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
export function QuizPage() {
    const { moduleId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const blockIndex = Number(new URLSearchParams(location.search).get("block") || "1");
    const lessonInBlock = Number(new URLSearchParams(location.search).get("lesson") || "1");
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [index, setIndex] = useState(0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (!moduleId)
            return;
        let cancelled = false;
        setIsLoading(true);
        api
            .get(`/quiz/${moduleId}?block=${blockIndex}&lesson=${lessonInBlock}`)
            .then(({ data }) => {
            if (!cancelled) {
                setQuiz(data);
                setAnswers({});
                setIndex(0);
                setResult(null);
            }
        })
            .catch(() => {
            if (!cancelled)
                setQuiz(null);
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [moduleId, blockIndex, lessonInBlock]);
    const current = useMemo(() => quiz?.questions[index] ?? null, [quiz, index]);
    const progress = quiz ? Math.round(((index + 1) / quiz.questions.length) * 100) : 0;
    async function submitQuiz() {
        if (!moduleId || !quiz)
            return;
        const payload = {};
        Object.entries(answers).forEach(([k, v]) => {
            payload[k] = v;
        });
        setIsSubmitting(true);
        try {
            const { data } = await api.post(`/quiz/${moduleId}/submit?block=${blockIndex}&lesson=${lessonInBlock}`, { answers: payload });
            setResult(data);
        }
        finally {
            setIsSubmitting(false);
        }
    }
    function restartQuiz() {
        setAnswers({});
        setIndex(0);
        setResult(null);
    }
    if (isLoading)
        return _jsx("div", { className: "mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0442\u0435\u0441\u0442..." });
    if (!quiz)
        return _jsx("div", { className: "mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u0422\u0435\u0441\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D." });
    if (result) {
        return (_jsxs("div", { className: "mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("div", { className: `mx-auto flex h-16 w-16 items-center justify-center rounded-full text-4xl ${result.passed ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`, children: result.passed ? "✓" : "✕" }), _jsx("h1", { className: "mt-4 text-5xl font-black text-slate-900 dark:text-white", children: result.passed ? "Отличный результат!" : "Попробуйте еще раз" }), _jsx("p", { className: "mt-2 text-lg text-slate-500 dark:text-slate-400", children: result.passed ? `Порог ${result.passThreshold}% пройден, модуль засчитан.` : `Нужно набрать минимум ${result.passThreshold}% для прохождения` }), _jsxs("p", { className: `mt-4 text-7xl font-black ${result.passed ? "text-emerald-500" : "text-brand-500"}`, children: [result.scorePercent, "%"] }), _jsxs("p", { className: "mt-2 text-xl text-slate-600 dark:text-slate-300", children: ["\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0445 \u043E\u0442\u0432\u0435\u0442\u043E\u0432: ", result.correct, " \u0438\u0437 ", result.total] }), result.passed ? _jsxs("p", { className: "mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400", children: ["+", result.xp, " XP \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E"] }) : null, _jsxs("div", { className: "mt-6 flex justify-center gap-3", children: [!result.passed ? (_jsx("button", { type: "button", onClick: restartQuiz, className: "rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600", children: "\u041F\u0440\u043E\u0439\u0442\u0438 \u0441\u043D\u043E\u0432\u0430" })) : null, _jsx("button", { type: "button", onClick: () => navigate(`/module/${moduleId}`), className: "rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800", children: "\u041A \u0443\u0440\u043E\u043A\u0430\u043C" })] })] }));
    }
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-4", children: [_jsx(Link, { to: `/module/${moduleId}`, className: "text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200", children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u043C\u043E\u0434\u0443\u043B\u044E" }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400", children: [_jsxs("span", { className: "font-semibold text-brand-500", children: ["\u0411\u043B\u043E\u043A ", quiz.blockIndex, quiz.lessonInBlock ? ` · урок ${quiz.lessonInBlock}` : ""] }), _jsxs("span", { children: ["\u0412\u043E\u043F\u0440\u043E\u0441 ", index + 1, " \u0438\u0437 ", quiz.questions.length] }), _jsxs("span", { className: "font-semibold text-brand-500", children: [progress, "%"] })] }), _jsx("div", { className: "mb-6 h-2 rounded-full bg-slate-200 dark:bg-slate-700", children: _jsx("div", { className: "h-2 rounded-full bg-slate-900 dark:bg-white", style: { width: `${progress}%` } }) }), current ? (_jsxs(_Fragment, { children: [_jsx("h1", { className: "mb-5 text-4xl font-black text-slate-900 dark:text-white", children: current.question }), _jsx("div", { className: "space-y-2", children: current.options.map((option, optionIdx) => {
                                    const active = answers[current.id] === optionIdx;
                                    return (_jsx("button", { type: "button", onClick: () => setAnswers((prev) => ({ ...prev, [current.id]: optionIdx })), className: `w-full rounded-xl border px-4 py-3 text-left text-lg transition ${active
                                            ? "border-brand-500 bg-brand-50 text-slate-900 dark:border-brand-400 dark:bg-brand-500/10 dark:text-white"
                                            : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"}`, children: option }, option));
                                }) }), _jsx("button", { type: "button", disabled: answers[current.id] === undefined || isSubmitting, onClick: () => {
                                    if (index === quiz.questions.length - 1) {
                                        submitQuiz();
                                        return;
                                    }
                                    setIndex((prev) => prev + 1);
                                }, className: "mt-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-600", children: index === quiz.questions.length - 1 ? "Завершить тест" : "Следующий вопрос" })] })) : null] })] }));
}
