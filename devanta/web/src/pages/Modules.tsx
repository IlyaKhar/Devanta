import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Course = {
  title: string;
  description: string;
  modules: number;
  duration: string;
  students: string;
  level: string;
  actionLabel: "Начать" | "Продолжить";
  image: string;
  icon: string;
  accentClass: string;
  discount?: string;
  isPopular?: boolean;
  isActive?: boolean;
};

const courses: Course[] = [
  {
    title: "JavaScript-разработчик",
    description: "Научись создавать интерактивные веб-приложения",
    modules: 15,
    duration: "9 месяцев",
    students: "12,450",
    level: "С нуля",
    actionLabel: "Продолжить",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80&auto=format&fit=crop",
    icon: "⚡",
    accentClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    discount: "25%",
    isPopular: true,
    isActive: true,
  },
  {
    title: "Python-разработчик",
    description: "Освой Python и начни карьеру в разработке и анализе данных",
    modules: 18,
    duration: "10 месяцев",
    students: "15,320",
    level: "С нуля",
    actionLabel: "Продолжить",
    image: "https://images.unsplash.com/photo-1526379095098-4003100d93d8?w=1200&q=80&auto=format&fit=crop",
    icon: "🐍",
    accentClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    discount: "60%",
    isPopular: true,
    isActive: true,
  },
  {
    title: "Golang-разработчик",
    description: "Высокопроизводительные backend-сервисы",
    modules: 12,
    duration: "8 месяцев",
    students: "8,890",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop",
    icon: "◆",
    accentClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
  {
    title: "Веб-разработчик",
    description: "Создавай сайты, веб-приложения с нуля до продакшна",
    modules: 25,
    duration: "12 месяцев",
    students: "18,760",
    level: "С нуля",
    actionLabel: "Продолжить",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop",
    icon: "🌐",
    accentClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    discount: "15%",
    isPopular: true,
    isActive: true,
  },
  {
    title: "Основы алгоритмов",
    description: "Разберись в алгоритмах и структурах данных",
    modules: 9,
    duration: "6 месяцев",
    students: "9,420",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80&auto=format&fit=crop",
    icon: "🧩",
    accentClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  {
    title: "Мобильная разработка",
    description: "Создавай мобильные приложения для iOS и Android",
    modules: 15,
    duration: "11 месяцев",
    students: "7,230",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80&auto=format&fit=crop",
    icon: "📱",
    accentClass: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  },
  {
    title: "React-разработчик",
    description: "Освой React и создавай современные SPA-интерфейсы",
    modules: 14,
    duration: "7 месяцев",
    students: "11,580",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80&auto=format&fit=crop",
    icon: "⚛️",
    accentClass: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    isPopular: true,
  },
  {
    title: "Backend-разработчик",
    description: "Разрабатывай серверную часть API и приложений",
    modules: 15,
    duration: "11 месяцев",
    students: "10,340",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
    icon: "🛠️",
    accentClass: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  },
  {
    title: "Работа с базами данных",
    description: "Научись работать с SQL и NoSQL базами данных",
    modules: 8,
    duration: "5 месяцев",
    students: "5,730",
    level: "С нуля",
    actionLabel: "Начать",
    image: "https://images.unsplash.com/photo-1532153955177-f59af40d6472?w=1200&q=80&auto=format&fit=crop",
    icon: "🗄️",
    accentClass: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  },
];

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
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "all"
              ? "bg-brand-500 text-white shadow-sm"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
          }`}
        >
          Все курсы
        </button>
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "active"
              ? "bg-brand-500 text-white shadow-sm"
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
          return (
            <article
              key={course.title}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img src={course.image} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span
                className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-base shadow-sm ${course.accentClass}`}
                aria-hidden
              >
                {course.icon}
              </span>
              {course.isPopular ? (
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-brand-600 shadow-sm dark:bg-slate-900/90 dark:text-brand-400">
                  Популярно
                </span>
              ) : null}
              {course.discount ? (
                <span className="absolute right-3 top-12 rounded-full bg-blue-500/90 px-2 py-1 text-xs font-semibold text-white shadow-sm">
                  {course.discount}
                </span>
              ) : null}
            </div>

            <div className="space-y-3 p-4">
              <h2 className="text-[1.4rem] font-bold leading-tight text-slate-900 dark:text-white">{course.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{course.description}</p>

              <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <p className="inline-flex items-center gap-1.5">
                  <span aria-hidden>🗂️</span>
                  {course.modules} модулей
                </p>
                <p className="inline-flex items-center gap-1.5">
                  <span aria-hidden>🕐</span>
                  {course.duration}
                </p>
                <p className="inline-flex items-center gap-1.5">
                  <span aria-hidden>📈</span>
                  {course.students} учеников
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{course.level}</span>
                <Link
                  to={`/module/${moduleId}`}
                  className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
                >
                  {course.actionLabel} →
                </Link>
              </div>
            </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
