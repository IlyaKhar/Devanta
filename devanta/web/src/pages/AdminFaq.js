import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
const categories = [
    { id: "general", title: "Общие вопросы" },
    { id: "courses", title: "Курсы и обучение" },
    { id: "progress", title: "Система прогресса" },
    { id: "parents", title: "Родительский контроль" },
    { id: "tech", title: "Технические вопросы" },
];
export function AdminFaqPage() {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [category, setCategory] = useState("general");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [notice, setNotice] = useState(null);
    async function loadRows() {
        setIsLoading(true);
        setNotice(null);
        try {
            const { data } = await api.get("/faq");
            const flat = data.flatMap((cat) => cat.items.map((item) => ({
                id: item.id,
                category: cat.id,
                question: item.q,
                answer: item.a,
            })));
            setRows(flat);
        }
        catch {
            setNotice("Не удалось загрузить FAQ. Проверь права admin.");
        }
        finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        loadRows();
    }, []);
    const sortedRows = useMemo(() => [...rows].sort((a, b) => (a.category === b.category ? a.id - b.id : a.category.localeCompare(b.category))), [rows]);
    async function handleSubmit(e) {
        e.preventDefault();
        if (!question.trim() || !answer.trim())
            return;
        setIsSaving(true);
        setNotice(null);
        try {
            if (editingId) {
                await api.put(`/admin/faq/${editingId}`, {
                    category,
                    question: question.trim(),
                    answer: answer.trim(),
                    sortOrder: 0,
                });
                setNotice("FAQ обновлен.");
            }
            else {
                await api.post("/admin/faq", {
                    category,
                    question: question.trim(),
                    answer: answer.trim(),
                    sortOrder: 0,
                });
                setNotice("FAQ создан.");
            }
            setEditingId(null);
            setQuestion("");
            setAnswer("");
            await loadRows();
        }
        catch {
            setNotice("Ошибка сохранения. Нужна роль admin.");
        }
        finally {
            setIsSaving(false);
        }
    }
    async function handleDelete(id) {
        setNotice(null);
        try {
            await api.delete(`/admin/faq/${id}`);
            setRows((prev) => prev.filter((row) => row.id !== id));
            if (editingId === id) {
                setEditingId(null);
                setQuestion("");
                setAnswer("");
            }
            setNotice("FAQ удален.");
        }
        catch {
            setNotice("Ошибка удаления. Нужна роль admin.");
        }
    }
    function handleEdit(row) {
        setEditingId(row.id);
        setCategory(row.category);
        setQuestion(row.question);
        setAnswer(row.answer);
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl space-y-5", children: [_jsxs("section", { children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "\u0410\u0434\u043C\u0438\u043D\u043A\u0430 FAQ" }), _jsx("p", { className: "mt-1 text-slate-500 dark:text-slate-400", children: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0438 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432 \u0434\u043B\u044F \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B FAQ." })] }), _jsx("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" }), _jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800", children: categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.title }, cat.id))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300", children: "\u0412\u043E\u043F\u0440\u043E\u0441" }), _jsx("input", { value: question, onChange: (e) => setQuestion(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u043F\u0440\u043E\u0441" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300", children: "\u041E\u0442\u0432\u0435\u0442" }), _jsx("textarea", { value: answer, onChange: (e) => setAnswer(e.target.value), rows: 4, className: "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "submit", disabled: isSaving, className: "rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60", children: editingId ? "Сохранить изменения" : "Добавить FAQ" }), editingId ? (_jsx("button", { type: "button", onClick: () => {
                                        setEditingId(null);
                                        setQuestion("");
                                        setAnswer("");
                                    }, className: "rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })) : null] })] }) }), notice ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300", children: notice })) : null, _jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h2", { className: "mb-3 text-xl font-bold text-slate-900 dark:text-white", children: "\u0421\u043F\u0438\u0441\u043E\u043A FAQ" }), isLoading ? _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C..." }) : null, _jsxs("div", { className: "space-y-2", children: [sortedRows.map((row) => (_jsxs("article", { className: "rounded-xl border border-slate-100 p-3 dark:border-slate-800", children: [_jsxs("div", { className: "mb-2 flex flex-wrap items-center justify-between gap-2", children: [_jsx("span", { className: "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200", children: categories.find((c) => c.id === row.category)?.title ?? row.category }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => handleEdit(row), className: "rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200", children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C" }), _jsx("button", { type: "button", onClick: () => handleDelete(row.id), className: "rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }), _jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: row.question }), _jsx("p", { className: "mt-1 text-sm text-slate-600 dark:text-slate-300", children: row.answer })] }, row.id))), !isLoading && sortedRows.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "FAQ \u043F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442." })) : null] })] })] }));
}
