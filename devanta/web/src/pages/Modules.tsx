import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { CourseCard } from "../components/course/CourseCard";
import { courses } from "../data/courseCatalog";

export function ModulesPage() {
  const [tab, setTab] = useState<"all" | "active">("all");
  const [serverModules, setServerModules] = useState<string[] | null>(null);
  const [serverModuleIdsByTitle, setServerModuleIdsByTitle] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    api
      .get<Array<{ id: number; title: string }>>(`/modules?tab=${tab}`)
      .then(({ data }) => {
        if (cancelled) return;
        const normalizedTitles = data.map((module) => module.title.trim().toLowerCase());
        const idMap = data.reduce<Record<string, number>>((acc, module) => {
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
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const visibleCourses = useMemo(() => {
    if (serverModules) {
      const serverSet = new Set(serverModules);
      const matched = courses.filter((course) => serverSet.has(course.title.trim().toLowerCase()));
      if (matched.length > 0) return matched;
    }

    if (tab === "active") return courses.filter((course) => course.isActive);
    return courses;
  }, [serverModules, tab]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Все курсы</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Выбери курс и начни свой путь в программировании
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "all"
              ? "bg-brand-500 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
            }`}
        >
          Все курсы
        </button>
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === "active"
              ? "bg-brand-500 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
            }`}
        >
          Активные
        </button>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Список курсов">
        {isLoading ? (
          <div className="col-span-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Загружаем курсы...
          </div>
        ) : null}
        {visibleCourses.map((course, index) => {
          const normalizedTitle = course.title.trim().toLowerCase();
          const moduleId = serverModuleIdsByTitle[normalizedTitle] ?? index + 1;
          return <CourseCard key={course.title} course={course} moduleId={moduleId} />;
        })}
      </section>
    </div>
  );
}
