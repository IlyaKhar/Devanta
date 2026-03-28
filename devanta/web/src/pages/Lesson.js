import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
/** Если ссылка YouTube — отдаём URL для iframe /embed/… */
function youtubeEmbedUrl(url) {
    const u = url.trim();
    if (!u)
        return null;
    if (u.includes("youtube.com/embed/"))
        return u;
    const fromQuery = u.match(/[?&]v=([^&]+)/);
    if (fromQuery?.[1])
        return `https://www.youtube.com/embed/${fromQuery[1]}`;
    const short = u.match(/youtu\.be\/([^?]+)/);
    if (short?.[1])
        return `https://www.youtube.com/embed/${short[1]}`;
    return null;
}
export function LessonPage() {
    const { id } = useParams();
    const [lesson, setLesson] = useState(null);
    const [task, setTask] = useState(null);
    const [step, setStep] = useState("video");
    useEffect(() => {
        if (!id)
            return;
        let cancelled = false;
        api
            .get(`/lessons/${id}`)
            .then(({ data }) => {
            if (!cancelled)
                setLesson(data);
        })
            .catch(() => {
            if (!cancelled)
                setLesson(null);
        });
        api
            .get(`/lessons/${id}/task`)
            .then(({ data }) => {
            if (!cancelled)
                setTask(data);
        })
            .catch(() => {
            if (!cancelled)
                setTask(null);
        });
        return () => {
            cancelled = true;
        };
    }, [id]);
    const stepLabel = useMemo(() => ({
        video: "Шаг 1: Видео",
        theory: "Шаг 2: Теория",
        quiz: "Шаг 3: Тест",
        task: "Шаг 4: Задание",
    })[step], [step]);
    const blockIndex = useMemo(() => {
        if (!lesson?.sortOrder)
            return 1;
        const lessonsPerBlock = 3;
        return Math.floor((lesson.sortOrder - 1) / lessonsPerBlock) + 1;
    }, [lesson?.sortOrder]);
    // Слот урока 1..3 внутри блока — к этому номеру привязан отдельный набор вопросов в API.
    const lessonInBlock = useMemo(() => {
        if (!lesson?.sortOrder)
            return 1;
        return ((lesson.sortOrder - 1) % 3) + 1;
    }, [lesson?.sortOrder]);
    const videoEmbedSrc = useMemo(() => (lesson?.videoUrl ? youtubeEmbedUrl(lesson.videoUrl) : null), [lesson?.videoUrl]);
    return (_jsxs("div", { className: "mx-auto max-w-4xl space-y-4", children: [_jsx(Link, { to: lesson ? `/module/${lesson.moduleId}` : "/modules", className: "text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200", children: "\u2190 \u041D\u0430\u0437\u0430\u0434 \u043A \u043C\u043E\u0434\u0443\u043B\u044E" }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 dark:text-white", children: lesson?.title ?? `Урок #${id}` }), _jsxs("p", { className: "mt-1 text-sm text-slate-500 dark:text-slate-400", children: [stepLabel, " \u0438\u0437 \u0443\u0447\u0435\u0431\u043D\u043E\u0433\u043E \u043F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u0430: \u0432\u0438\u0434\u0435\u043E \u2192 \u0442\u0435\u043E\u0440\u0438\u044F \u2192 \u0442\u0435\u0441\u0442 \u2192 \u0437\u0430\u0434\u0430\u043D\u0438\u0435"] }), _jsxs("div", { className: "mt-4 grid gap-2 sm:grid-cols-4", children: [_jsx("button", { type: "button", onClick: () => setStep("video"), className: `rounded-xl px-3 py-2 text-sm font-semibold ${step === "video" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`, children: "\u0412\u0438\u0434\u0435\u043E" }), _jsx("button", { type: "button", onClick: () => setStep("theory"), className: `rounded-xl px-3 py-2 text-sm font-semibold ${step === "theory" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`, children: "\u0422\u0435\u043E\u0440\u0438\u044F" }), _jsx("button", { type: "button", onClick: () => setStep("quiz"), className: `rounded-xl px-3 py-2 text-sm font-semibold ${step === "quiz" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`, children: "\u0422\u0435\u0441\u0442" }), _jsx("button", { type: "button", onClick: () => setStep("task"), className: `rounded-xl px-3 py-2 text-sm font-semibold ${step === "task" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`, children: "\u0417\u0430\u0434\u0430\u043D\u0438\u0435" })] }), _jsxs("div", { className: "mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700", children: [step === "video" ? (lesson?.videoUrl ? (_jsxs("div", { className: "space-y-3", children: [videoEmbedSrc ? (_jsx("div", { className: "aspect-video w-full overflow-hidden rounded-xl bg-black", children: _jsx("iframe", { title: "\u0412\u0438\u0434\u0435\u043E \u0443\u0440\u043E\u043A\u0430", className: "h-full w-full", src: videoEmbedSrc, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowFullScreen: true }) })) : null, _jsx("a", { href: lesson.videoUrl, target: "_blank", rel: "noreferrer", className: "inline-block text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400", children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443 \u0432 \u043D\u043E\u0432\u043E\u0439 \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u2192" })] })) : (_jsx("p", { className: "text-slate-700 dark:text-slate-300", children: "\u0412\u0438\u0434\u0435\u043E \u043F\u043E\u043A\u0430 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u043E." }))) : null, step === "theory" ? _jsx("p", { className: "text-slate-700 dark:text-slate-300 whitespace-pre-line", children: lesson?.content || "Теоретический материал урока пока пуст." }) : null, step === "quiz" ? (_jsx(Link, { to: lesson ? `/quiz/${lesson.moduleId}?block=${blockIndex}&lesson=${lessonInBlock}` : "/modules", className: "inline-flex rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600", children: "\u0422\u0435\u0441\u0442 \u043F\u043E \u044D\u0442\u043E\u043C\u0443 \u0443\u0440\u043E\u043A\u0443" })) : null, step === "task" ? (task ? (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: task.title }), _jsx("p", { className: "text-sm text-slate-600 dark:text-slate-300", children: task.question }), _jsxs(Link, { to: `/task/${task.id}`, className: "inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200", children: ["\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u043A\u0443 (+", task.xpReward, " XP)"] })] })) : (_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0434\u0430\u0447\u043A\u0430 \u0434\u043B\u044F \u044D\u0442\u043E\u0433\u043E \u0431\u043B\u043E\u043A\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430." }))) : null] })] })] }));
}
