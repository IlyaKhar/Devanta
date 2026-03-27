import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Summary = {
  fullName: string;
  username: string;
  xp: number;
  level: number;
  tasksSolved: number;
};

type ModuleItem = { id: number; title: string; sortOrder: number };
type ModuleMeta = ModuleItem & { durationMonths: number; students: number; rating: number; level: string };

function iconByTitle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("javascript")) return "⚡";
  if (lower.includes("python")) return "🐍";
  if (lower.includes("golang")) return "◆";
  if (lower.includes("веб")) return "🌐";
  if (lower.includes("алгоритм")) return "🧩";
  if (lower.includes("мобильн")) return "📱";
  return "📚";
}

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
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">С возвращением, {name}! 👋</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Продолжай учиться и двигаться к своей цели.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Текущий уровень</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary?.level ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Решено задач</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summary?.tasksSolved ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popularCourses.map((course) => (
            <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl">{iconByTitle(course.title)}</p>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{course.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">🕐 {course.durationMonths || "—"} {course.durationMonths === 1 ? "месяц" : "месяцев"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">📈 {course.students || 0} учеников</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">{course.level || "С нуля"} · ⭐ {course.rating ? course.rating.toFixed(1) : "—"}</span>
                <Link to={`/module/${course.id}`} className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Начать →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
