import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
const fallbackCategories = [
    {
        id: "general",
        title: "Общие вопросы",
        icon: "💬",
        items: [
            {
                q: "Что такое Devanta?",
                a: "Devanta - это образовательная платформа, где ученики 7–15 лет изучают программирование через уроки, практические задачи и геймификацию.",
            },
            {
                q: "Для какого возраста подходит платформа?",
                a: "Основная аудитория - школьники 7–15 лет. Контент подается простым языком и разбит на короткие шаги.",
            },
            { q: "Нужно ли устанавливать что-то на компьютер?", a: "Нет. Большая часть обучения проходит прямо в браузере." },
            { q: "Как начать обучение?", a: "Зарегистрируй аккаунт, выбери курс и открой первый модуль." },
        ],
    },
    {
        id: "courses",
        title: "Курсы и обучение",
        icon: "🎓",
        items: [
            { q: "Какие курсы доступны?", a: "JavaScript, Python, Golang, Web, Алгоритмы, Mobile и другие направления." },
            { q: "Сколько времени занимает курс?", a: "В среднем 6–12 месяцев, зависит от темпа ученика и сложности программы." },
            { q: "Можно ли проходить несколько курсов одновременно?", a: "Да, можно изучать несколько направлений параллельно." },
            { q: "Есть ли сертификат после завершения?", a: "Планируется. Сейчас фиксируются достижения, XP и прогресс по модулям." },
        ],
    },
    {
        id: "progress",
        title: "Система прогресса",
        icon: "🏆",
        items: [
            { q: "Как работает система XP и уровней?", a: "За уроки, задачи и квизы начисляется XP. Уровень растет автоматически." },
            { q: "Что такое достижения?", a: "Это награды за ключевые этапы: первые уроки, серии задач, скорость решения." },
            { q: "Где посмотреть свой прогресс?", a: "В личном кабинете по клику на аватар справа сверху." },
            { q: "Почему прогресс может обновляться не сразу?", a: "Иногда обновление занимает несколько секунд из-за синхронизации с сервером." },
        ],
    },
    {
        id: "parents",
        title: "Родительский контроль",
        icon: "👨‍👩‍👧",
        items: [
            { q: "Есть ли режим для родителей?", a: "Да, предусмотрен раздел родительского контроля для просмотра активности ребенка." },
            { q: "Какие данные доступны родителю?", a: "Прогресс по модулям, результаты задач и динамика обучения." },
            { q: "Можно ли ограничить нагрузку?", a: "Да, можно регулировать темп, выбирая количество уроков и задач в неделю." },
        ],
    },
    {
        id: "tech",
        title: "Технические вопросы",
        icon: "🛠️",
        items: [
            { q: "Не открывается урок, что делать?", a: "Обнови страницу, проверь интернет и попробуй снова. Если не помогло - напиши в поддержку." },
            { q: "Сайт работает медленно", a: "Попробуй другой браузер, отключи лишние расширения и перезапусти вкладку." },
            { q: "Как связаться с поддержкой?", a: "Через кнопку внизу страницы FAQ или на email support@devanta.local." },
        ],
    },
];
export function FaqPage() {
    const [query, setQuery] = useState("");
    const [opened, setOpened] = useState({});
    const [categories, setCategories] = useState(fallbackCategories);
    useEffect(() => {
        let cancelled = false;
        api
            .get("/faq")
            .then(({ data }) => {
            if (!cancelled && data.length > 0)
                setCategories(data);
        })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, []);
    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized)
            return categories;
        return categories
            .map((cat) => ({
            ...cat,
            items: cat.items.filter((item) => item.q.toLowerCase().includes(normalized) || item.a.toLowerCase().includes(normalized)),
        }))
            .filter((cat) => cat.items.length > 0);
    }, [query]);
    function toggle(key) {
        setOpened((prev) => ({ ...prev, [key]: !prev[key] }));
    }
    return (_jsx("div", { className: "min-h-screen bg-[#FAFAF8] text-slate-800", children: _jsxs("main", { className: "mx-auto max-w-5xl px-4 py-10", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("p", { className: "text-4xl", children: "\u2753" }), _jsx("h1", { className: "mt-2 text-4xl font-black text-slate-900", children: "\u0427\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B" }), _jsx("p", { className: "mt-2 text-slate-500", children: "\u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u0438 \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 \u043F\u043E\u043C\u043E\u0449\u044C" })] }), _jsx("div", { className: "mb-8", children: _jsx("input", { type: "search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432...", className: "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2" }) }), _jsx("div", { className: "space-y-4", children: filtered.map((cat) => (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("h2", { className: "mb-3 text-xl font-bold text-slate-900", children: [_jsx("span", { className: "mr-2", children: cat.icon }), cat.title] }), _jsx("div", { className: "space-y-2", children: cat.items.map((item, idx) => {
                                    const key = `${cat.id}-${idx}`;
                                    const isOpen = Boolean(opened[key]);
                                    return (_jsxs("article", { className: "rounded-xl border border-slate-100", children: [_jsxs("button", { type: "button", onClick: () => toggle(key), className: "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50", "aria-expanded": isOpen, children: [_jsx("span", { children: item.q }), _jsx("span", { "aria-hidden": true, children: isOpen ? "−" : "+" })] }), isOpen ? _jsx("p", { className: "px-3 pb-3 text-sm leading-relaxed text-slate-600", children: item.a }) : null] }, key));
                                }) })] }, cat.id))) }), _jsxs("section", { className: "mt-8 rounded-2xl bg-brand-500 px-6 py-8 text-center text-white shadow-sm", children: [_jsx("h3", { className: "text-2xl font-bold", children: "\u041D\u0435 \u043D\u0430\u0448\u043B\u0438 \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0441\u0432\u043E\u0439 \u0432\u043E\u043F\u0440\u043E\u0441?" }), _jsx("p", { className: "mt-2 text-brand-50", children: "\u0421\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0441\u043B\u0443\u0436\u0431\u043E\u0439 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0438, \u043C\u044B \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u043C\u043E\u0436\u0435\u043C." }), _jsx("a", { href: "mailto:support@devanta.local", className: "mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50", children: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439" })] }), _jsx("div", { className: "mt-8 text-center text-sm", children: _jsx(Link, { to: "/", className: "font-semibold text-brand-600 hover:text-brand-700", children: "\u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E" }) })] }) }));
}
