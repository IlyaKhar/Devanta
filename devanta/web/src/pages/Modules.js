import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { CourseCard } from "../components/course/CourseCard";
import { courses } from "../data/courseCatalog";
export function ModulesPage() {
    const [tab, setTab] = useState("all");
    const [serverModules, setServerModules] = useState(null);
    const [serverModuleIdsByTitle, setServerModuleIdsByTitle] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        api
            .get(`/modules?tab=${tab}`)
            .then(({ data }) => {
            if (cancelled)
                return;
            const normalizedTitles = data.map((module) => module.title.trim().toLowerCase());
            const idMap = data.reduce((acc, module) => {
                acc[module.title.trim().toLowerCase()] = module.id;
                return acc;
            }, {});
            setServerModules(normalizedTitles);
            setServerModuleIdsByTitle(idMap);
        })
            .catch(() => {
            if (!cancelled) {
                setServerModules(null);
                setServerModuleIdsByTitle({});
            }
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [tab]);
    const visibleCourses = useMemo(() => {
        if (serverModules) {
            const serverSet = new Set(serverModules);
            const matched = courses.filter((course) => serverSet.has(course.title.trim().toLowerCase()));
            if (matched.length > 0)
                return matched;
        }
        if (tab === "active")
            return courses.filter((course) => course.isActive);
        return courses;
    }, [serverModules, tab]);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-slate-900 dark:text-white", children: "\u0412\u0441\u0435 \u043A\u0443\u0440\u0441\u044B" }), _jsx("p", { className: "mt-2 text-slate-600 dark:text-slate-400", children: "\u0412\u044B\u0431\u0435\u0440\u0438 \u043A\u0443\u0440\u0441 \u0438 \u043D\u0430\u0447\u043D\u0438 \u0441\u0432\u043E\u0439 \u043F\u0443\u0442\u044C \u0432 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setTab("all"), className: `rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "all"
                            ? "bg-brand-500 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"}`, children: "\u0412\u0441\u0435 \u043A\u0443\u0440\u0441\u044B" }), _jsx("button", { type: "button", onClick: () => setTab("active"), className: `rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "active"
                            ? "bg-brand-500 text-white"
                            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"}`, children: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435" })] }), _jsxs("section", { className: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3", "aria-label": "\u0421\u043F\u0438\u0441\u043E\u043A \u043A\u0443\u0440\u0441\u043E\u0432", children: [isLoading ? (_jsx("div", { className: "col-span-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400", children: "\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043A\u0443\u0440\u0441\u044B..." })) : null, visibleCourses.map((course, index) => {
                        const normalizedTitle = course.title.trim().toLowerCase();
                        const moduleId = serverModuleIdsByTitle[normalizedTitle] ?? index + 1;
                        return _jsx(CourseCard, { course: course, moduleId: moduleId }, course.title);
                    })] })] }));
}
