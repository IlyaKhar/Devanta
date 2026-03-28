import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
export function TaskPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (!id)
            return;
        let cancelled = false;
        setIsLoading(true);
        api
            .get(`/tasks/${id}`)
            .then(({ data }) => {
            if (!cancelled)
                setTask(data);
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
    return (_jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [_jsx("button", { type: "button", onClick: () => navigate(-1), className: "text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200", children: "\u2190 \u041D\u0430\u0437\u0430\u0434" }), _jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [isLoading ? _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u0437\u0430\u0434\u0430\u0447\u043A\u0443..." }) : null, !isLoading && !task ? _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0434\u0430\u0447\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430." }) : null, task ? (_jsxs(_Fragment, { children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: task.title }), _jsx("p", { className: "mt-2 text-slate-600 dark:text-slate-300", children: task.question }), _jsxs("p", { className: "mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400", children: ["\u041D\u0430\u0433\u0440\u0430\u0434\u0430: +", task.xpReward, " XP"] }), _jsx("p", { className: "mt-6 text-sm text-slate-500 dark:text-slate-400", children: "\u0420\u0435\u0434\u0430\u043A\u0442\u043E\u0440 \u043A\u043E\u0434\u0430 \u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F - \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u043C \u0448\u0430\u0433\u043E\u043C." })] })) : null] })] }));
}
