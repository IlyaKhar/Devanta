import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
// Картинки в src/public/ — только статические new URL(), иначе Vite не положит файлы в сборку.
const languages = [
    {
        name: "Python",
        imageSrc: new URL("../public/python.png", import.meta.url).href,
        difficulty: "Лёгкий",
        popularity: "98%",
        desc: "Простой синтаксис - идеально для первых шагов в коде.",
        uses: ["Веб", "Данные", "Автоматизация"],
        ides: ["VS Code", "PyCharm"],
    },
    {
        name: "JavaScript",
        imageSrc: new URL("../public/javascript.png", import.meta.url).href,
        difficulty: "Средний",
        popularity: "95%",
        desc: "Язык веба: интерактивные страницы и игры в браузере.",
        uses: ["Фронтенд", "Игры", "Серверы"],
        ides: ["VS Code", "WebStorm"],
    },
    {
        name: "Java",
        imageSrc: new URL("../public/java.png", import.meta.url).href,
        difficulty: "Средний",
        popularity: "92%",
        desc: "Надёжный язык для приложений и больших проектов.",
        uses: ["Android", "Серверы", "Корпоративные системы"],
        ides: ["IntelliJ IDEA", "Eclipse"],
    },
    {
        name: "C++",
        imageSrc: new URL("../public/cpp.png", import.meta.url).href,
        difficulty: "Сложный",
        popularity: "88%",
        desc: "Скорость и контроль - основа игр и системного ПО.",
        uses: ["Игры", "Графика", "Встраиваемые системы"],
        ides: ["Visual Studio", "CLion"],
    },
    {
        name: "C#",
        imageSrc: new URL("../public/csharp.png", import.meta.url).href,
        difficulty: "Средний",
        popularity: "85%",
        desc: "Удобный язык от Microsoft для игр и приложений.",
        uses: ["Unity", "Windows", "Веб"],
        ides: ["Visual Studio", "Rider"],
    },
    {
        name: "Swift",
        imageSrc: new URL("../public/swift.png", import.meta.url).href,
        difficulty: "Средний",
        popularity: "80%",
        desc: "Современный язык для приложений под Apple.",
        uses: ["iOS", "macOS", "Мобильные приложения"],
        ides: ["Xcode", "VS Code"],
    },
];
const testimonials = [
    {
        name: "Ева",
        imageSrc: new URL("../public/eva.png", import.meta.url).href,
        text: "Ева была в поиске полезных занятий для сына. До этого он просто играл в телефоне, а теперь - сам заходит в приложение каждый день и учится с интересом.",
    },
    {
        name: "Дмитрий",
        imageSrc: new URL("../public/dmitry.png", import.meta.url).href,
        text: "Дмитрий всегда мечтал научиться программировать. С нашей платформой он смог начать с нуля и уже создает свои первые проекты.",
    },
    {
        name: "Анна",
        imageSrc: new URL("../public/anna.png", import.meta.url).href,
        text: "Анна искала интересный способ провести время с пользой. Теперь программирование стало её любимым хобби и новой карьерной целью.",
    },
    {
        name: "Никита",
        imageSrc: new URL("../public/maxim.png", import.meta.url).href,
        text: "Никита учится в 8 классе и уже мечтает стать разработчиком. Наше приложение помогает ему развивать навыки каждый день.",
    },
];
/**
 * Логотип языка (48×48 в вёрстке). eager + fetchPriority для первых карточек (above the fold),
 * остальные — lazy + low, чтобы не забивать канал тяжёлыми фото ниже.
 */
function LanguageImage({ src, title, eager = false }) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (_jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700", "aria-hidden": true, children: title[0] }));
    }
    return (_jsx("img", { src: src, alt: "", width: 48, height: 48, className: "h-12 w-12 shrink-0 rounded-xl bg-slate-50 object-contain p-1 ring-1 ring-slate-100", loading: eager ? "eager" : "lazy", decoding: "async", fetchPriority: eager ? "auto" : "low", sizes: "48px", onError: () => setFailed(true) }));
}
/** Верх карточки отзыва в макете Figma - портрет на всю ширину, сильное скругление. */
function TestimonialCover({ src, name }) {
    const [failed, setFailed] = useState(false);
    if (failed) {
        return (_jsx("div", { className: "flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 text-4xl font-bold text-brand-700", "aria-hidden": true, children: name[0] }));
    }
    return (_jsx("img", { src: src, alt: name, width: 600, height: 800, className: "h-full w-full object-cover", loading: "lazy", decoding: "async", fetchPriority: "low", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw", onError: () => setFailed(true) }));
}
function BriefcaseMini({ className = "" }) {
    return (_jsx("svg", { className: className, width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M4 9h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9z", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
function KeyboardMini({ className = "" }) {
    return (_jsxs("svg", { className: className, width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, children: [_jsx("rect", { x: "2", y: "7", width: "20", height: "10", rx: "2", stroke: "currentColor", strokeWidth: "1.75" }), _jsx("path", { d: "M6 11h.01M10 11h4M16 11h.01M8 14h8", stroke: "currentColor", strokeWidth: "1.75", strokeLinecap: "round" })] }));
}
function LogoMark({ className = "" }) {
    return (_jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white ${className}`, "aria-hidden": true, children: "</>" }));
}
export function HomePage() {
    return (_jsxs("div", { className: "min-h-screen bg-[#FAFAF8] text-slate-800", children: [_jsx("header", { className: "sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md", children: _jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [_jsx(LogoMark, {}), _jsx("span", { className: "text-lg font-semibold text-brand-600", children: "Devanta" })] }), _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx(Link, { to: "/login", className: "hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline", children: "\u0412\u043E\u0439\u0442\u0438" }), _jsx(Link, { to: "/register", className: "rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600", children: "\u041D\u0430\u0447\u0430\u0442\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435" })] })] }) }), _jsxs("main", { children: [_jsx("section", { className: "border-b border-slate-100 bg-gradient-to-b from-white to-brand-50/40 px-4 py-14 sm:py-20", children: _jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [_jsxs("h1", { className: "text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl", children: ["\u041D\u0430\u0443\u0447\u0438\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u0442\u044C", " ", _jsx("span", { className: "text-brand-600", children: "\u0438\u0433\u0440\u0430\u044E\u0447\u0438" })] }), _jsx("p", { className: "mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg", children: "\u0418\u043D\u0442\u0435\u0440\u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0443\u0440\u043E\u043A\u0438, \u043C\u0438\u043D\u0438-\u0438\u0433\u0440\u044B \u0438 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u043F\u0440\u044F\u043C\u043E \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0420\u0430\u0437\u0432\u0438\u0432\u0430\u0439 \u043B\u043E\u0433\u0438\u043A\u0443 \u0438 \u0446\u0438\u0444\u0440\u043E\u0432\u0443\u044E \u0433\u0440\u0430\u043C\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u043A\u0443\u0440\u0430\u0442\u043E\u0440\u0430\u043C\u0438 \u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u043E\u043C \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432." }), _jsx("div", { className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row", children: _jsx(Link, { to: "/register", className: "inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-brand-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-brand-600 sm:w-auto", children: "\u041D\u0430\u0447\u0430\u0442\u044C \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E" }) }), _jsxs("div", { className: "mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-100", children: [_jsx("p", { className: "text-2xl font-bold text-brand-600", children: "50 000+" }), _jsx("p", { className: "text-sm text-slate-600", children: "\u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432" })] }), _jsxs("div", { className: "rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-100", children: [_jsx("p", { className: "text-2xl font-bold text-brand-600", children: "100+" }), _jsx("p", { className: "text-sm text-slate-600", children: "\u043A\u0443\u0440\u0441\u043E\u0432 \u0438 \u043C\u043E\u0434\u0443\u043B\u0435\u0439" })] }), _jsxs("div", { className: "rounded-2xl bg-white/80 px-4 py-4 ring-1 ring-slate-100", children: [_jsx("p", { className: "text-2xl font-bold text-brand-600", children: "1000+" }), _jsx("p", { className: "text-sm text-slate-600", children: "\u0437\u0430\u0434\u0430\u0447 \u0438 \u043A\u0432\u0438\u0437\u043E\u0432" })] })] })] }) }), _jsx("section", { className: "px-4 py-14 sm:py-16", children: _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsxs("div", { className: "mb-10 text-center", children: [_jsxs("div", { className: "mb-3 flex items-center justify-center gap-2 text-brand-600", children: [_jsx("span", { className: "text-xl font-bold", "aria-hidden": true, children: "</>" }), _jsx("h2", { className: "text-2xl font-bold text-slate-900 sm:text-3xl", children: "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u044F\u0437\u044B\u043A\u0438 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F" })] }), _jsx("p", { className: "mx-auto max-w-2xl text-slate-600", children: "\u0412\u044B\u0431\u0435\u0440\u0438 \u044F\u0437\u044B\u043A \u0438 \u043D\u0430\u0447\u043D\u0438 \u0441\u0432\u043E\u0439 \u043F\u0443\u0442\u044C \u0432 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438 \u0443\u0436\u0435 \u0441\u0435\u0433\u043E\u0434\u043D\u044F." })] }), _jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: languages.map((lang, idx) => (_jsxs("article", { className: "flex flex-col rounded-2xl border border-slate-100/80 bg-white p-5 transition", children: [_jsxs("div", { className: "mb-4 flex items-start gap-3", children: [_jsx(LanguageImage, { src: lang.imageSrc, title: lang.name, eager: idx < 3 }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: lang.name }), _jsx("span", { className: "mt-2 inline-block rounded-full bg-brand-500 px-2.5 py-0.5 text-xs font-semibold text-white", children: lang.difficulty })] }), _jsxs("div", { className: "shrink-0 text-right", children: [_jsx("p", { className: "text-lg font-bold leading-none text-brand-600", children: lang.popularity }), _jsx("p", { className: "mt-1 text-[11px] text-slate-500", children: "\u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u044C" })] })] }), _jsx("p", { className: "mb-4 flex-1 text-sm leading-relaxed text-slate-600", children: lang.desc }), _jsxs("div", { className: "mb-3", children: [_jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700", children: [_jsx(BriefcaseMini, { className: "shrink-0 text-amber-800/90" }), "\u0413\u0434\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F"] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: lang.uses.map((t) => (_jsx("span", { className: "rounded-lg bg-slate-100/90 px-2.5 py-1 text-xs font-medium text-slate-700", children: t }, t))) })] }), _jsxs("div", { children: [_jsxs("p", { className: "mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700", children: [_jsx(KeyboardMini, { className: "shrink-0 text-slate-800" }), "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 IDE"] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: lang.ides.map((t) => (_jsx("span", { className: "rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-100", children: t }, t))) })] })] }, lang.name))) }), _jsx("div", { className: "mt-10 flex justify-center", children: _jsx(Link, { to: "/register", className: "inline-flex rounded-2xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-brand-600", children: "\u041D\u0430\u0447\u0430\u0442\u044C \u0438\u0437\u0443\u0447\u0435\u043D\u0438\u0435 \u044F\u0437\u044B\u043A\u043E\u0432" }) })] }) }), _jsx("section", { className: "border-y border-slate-100 bg-white px-4 py-14 sm:py-16", children: _jsxs("div", { className: "mx-auto max-w-6xl", children: [_jsx("h2", { className: "mb-2 text-center text-2xl font-bold text-slate-900 sm:text-3xl", children: "IT - \u044D\u0442\u043E \u043F\u0440\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438, \u0430 \u043D\u0435 \u043F\u0440\u043E \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "mx-auto mb-10 max-w-2xl text-center text-slate-600", children: "\u0423 \u043D\u0438\u0445 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C - \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0441\u044F \u0438 \u0443 \u0432\u0430\u0441" }), _jsx("div", { className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: testimonials.map((t) => (_jsxs("figure", { className: "flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white", children: [_jsx("div", { className: "relative aspect-[3/4] w-full shrink-0 overflow-hidden", children: _jsx(TestimonialCover, { src: t.imageSrc, name: t.name }) }), _jsxs("div", { className: "flex flex-1 flex-col p-5 pt-4", children: [_jsx("figcaption", { className: "text-base font-bold text-slate-900", children: t.name }), _jsx("blockquote", { className: "mt-2 text-left text-sm leading-relaxed text-slate-600", children: t.text })] })] }, t.name))) }), _jsx("div", { className: "mt-10 flex justify-center", children: _jsx(Link, { to: "/reviews", className: "text-sm font-semibold text-brand-600 underline-offset-2 hover:underline", children: "\u0412\u0441\u0435 \u043E\u0442\u0437\u044B\u0432\u044B" }) })] }) }), _jsx("section", { className: "px-4 py-14", children: _jsxs("div", { className: "mx-auto max-w-4xl rounded-3xl bg-brand-500 px-6 py-12 text-center sm:px-10 sm:py-14", children: [_jsx("h2", { className: "text-2xl font-bold text-white sm:text-3xl", children: "\u0413\u043E\u0442\u043E\u0432 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0432\u043E\u0451 \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0435 \u0432 \u043C\u0438\u0440 \u043A\u043E\u0434\u0430?" }), _jsx("p", { className: "mx-auto mt-3 max-w-xl text-brand-50", children: "\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0439\u0441\u044F \u043A \u0442\u044B\u0441\u044F\u0447\u0430\u043C \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432: \u0443\u0440\u043E\u043A\u0438 \u0438 \u0437\u0430\u0434\u0430\u0447\u0438 \u043F\u043E\u043C\u043E\u0433\u0443\u0442 \u043D\u0435 \u0441\u043E\u0440\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u043F\u043E\u043B\u043F\u0443\u0442\u0438." }), _jsx(Link, { to: "/register", className: "mt-8 inline-flex rounded-2xl bg-white px-8 py-3.5 text-base font-semibold text-brand-600 transition hover:bg-brand-50", children: "\u041D\u0430\u0447\u0430\u0442\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435 \u0441\u0435\u0439\u0447\u0430\u0441" })] }) })] }), _jsxs("footer", { className: "border-t border-slate-200 bg-slate-100/80", children: [_jsxs("div", { className: "mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-3 flex items-center gap-2", children: [_jsx(LogoMark, { className: "!h-8 !w-8" }), _jsx("span", { className: "font-semibold text-brand-600", children: "Devanta" })] }), _jsx("p", { className: "text-sm text-slate-600", children: "\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0434\u043B\u044F \u0448\u043A\u043E\u043B\u044C\u043D\u0438\u043A\u043E\u0432 7\u201315 \u043B\u0435\u0442: \u043E\u0441\u043D\u043E\u0432\u044B \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F, \u0446\u0438\u0444\u0440\u043E\u0432\u0430\u044F \u0433\u0440\u0430\u043C\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u0438 \u0433\u0435\u0439\u043C\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u0432 \u043E\u0434\u043D\u043E\u043C \u043C\u0435\u0441\u0442\u0435." })] }), _jsxs("div", { children: [_jsx("h3", { className: "mb-3 text-sm font-semibold text-slate-900", children: "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430" }), _jsxs("ul", { className: "space-y-2 text-sm text-slate-600", children: [_jsx("li", { children: _jsx(Link, { to: "/faq", className: "hover:text-brand-600", children: "FAQ" }) }), _jsx("li", { children: _jsx("a", { href: "mailto:support@devanta.local", className: "hover:text-brand-600", children: "\u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043D\u0430\u043C\u0438" }) }), _jsx("li", { children: _jsx(Link, { to: "/faq", className: "hover:text-brand-600", children: "\u0421\u043E\u043E\u0431\u0449\u0438\u0442\u044C \u043E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0435" }) })] })] })] }), _jsxs("div", { className: "border-t border-slate-200/80 py-4 text-center text-xs text-slate-500", children: ["\u00A9 ", new Date().getFullYear(), " Devanta. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B."] })] })] }));
}
