import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { CourseCard } from "../components/course/CourseCard";
import { findCourseByTitle } from "../data/courseCatalog";

type Summary = {
  fullName: string;
  username: string;
  xp: number;
  level: number;
  tasksSolved: number;
};

type ModuleItem = { id: number; title: string; sortOrder: number };
type ModuleMeta = ModuleItem & { durationMonths: number; students: number; rating: number; level: string };

export function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [modules, setModules] = useState<ModuleMeta[]>([]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Summary>("/me/summary")
      .then(({ data }) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    api
      .get<ModuleMeta[]>("/modules?tab=all")
      .then(({ data }) => {
        if (!cancelled) setModules(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setModules([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const name = useMemo(() => summary?.fullName?.trim() || summary?.username?.trim() || "Ученик", [summary]);
  const popularCourses = useMemo(() => modules.slice(0, 6), [modules]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">С возвращением, {name}!</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Продолжай учиться и двигаться к своей цели.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Текущий уровень</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary?.level ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Решено задач</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary?.tasksSolved ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Получено XP</p>
          <p className="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">{summary?.xp ?? 0}</p>
        </div>
      </section>

      <section aria-labelledby="popular-courses-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="popular-courses-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
            Популярные курсы
          </h2>
          <Link to="/modules" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Все курсы →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {popularCourses.map((m) => {
            const catalog = findCourseByTitle(m.title);
            if (catalog) {
              return <CourseCard key={m.id} course={catalog} moduleId={m.id} />;
            }
            return (
              <article
                key={m.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{m.title}</h3>
                  <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>
                      🕐 {m.durationMonths || "—"} {m.durationMonths === 1 ? "месяц" : "месяцев"}
                    </span>
                    <span>📈 {m.students ?? 0} учеников</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{m.level || "С нуля"}</span>
                    <Link
                      to={`/module/${m.id}`}
                      className="text-sm font-semibold text-brand-600 dark:text-brand-400"
                    >
                      Начать →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
