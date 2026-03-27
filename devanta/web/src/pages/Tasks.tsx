import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type Difficulty = "Легко" | "Средне" | "Сложно";

type Challenge = {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  duration: string;
};

type TaskItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  xp: number;
  time: string;
  solves: number;
  difficulty: Difficulty;
  completed?: boolean;
};

function difficultyBadgeClass(level: Difficulty) {
  if (level === "Легко")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30";
  if (level === "Средне")
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30";
  return "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30";
}

export function TasksPage() {
  const [filter, setFilter] = useState<"Все" | Difficulty>("Все");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [specialChallenges, setSpecialChallenges] = useState<Challenge[]>([]);
  const [isLoadingSpecial, setIsLoadingSpecial] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingSpecial(true);
    api
      .get<Challenge[]>("/tasks/special")
      .then(({ data }) => {
        if (!cancelled) setSpecialChallenges(data);
      })
      .catch(() => {
        if (!cancelled) setSpecialChallenges([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSpecial(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingTasks(true);

    const difficultyMap: Record<"Все" | Difficulty, string> = {
      Все: "all",
      Легко: "easy",
      Средне: "medium",
      Сложно: "hard",
    };

    api
      .get<TaskItem[]>(`/tasks?difficulty=${difficultyMap[filter]}`)
      .then(({ data }) => {
        if (!cancelled) setTasks(data);
      })
      .catch(() => {
        if (!cancelled) setTasks([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTasks(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span aria-hidden>🏆</span>
          Задачи и челленджи
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Прокачивай свои навыки, решая практические задания
        </p>
      </section>

      <section className="space-y-4" aria-labelledby="special-tasks">
        <h2 id="special-tasks" className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <span aria-hidden>⚡</span>
          Специальные задачи
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          {isLoadingSpecial ? (
            <div className="col-span-full rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Загружаем спецзадачи...
            </div>
          ) : null}
          {specialChallenges.map((challenge) => (
            <article
              key={challenge.id}
              className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{challenge.title}</h3>
                <span className="rounded-full bg-brand-500 px-2 py-1 text-xs font-semibold text-white">
                  +{challenge.rewardXp} XP
                </span>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{challenge.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <span aria-hidden>🕒</span>
                  {challenge.duration}
                </span>
                <button
                  type="button"
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Начать
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="all-tasks">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="all-tasks" className="text-2xl font-bold text-slate-900 dark:text-white">
            Все задачи
          </h2>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
            {(["Все", "Легко", "Средне", "Сложно"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  filter === item
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {isLoadingTasks ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Загружаем задачи...
            </div>
          ) : null}
          {tasks.map((task) => (
            <article
              key={task.id}
              className={`rounded-2xl border p-4 shadow-sm transition md:p-5 ${
                task.completed
                  ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyBadgeClass(task.difficulty)}`}>
                  {task.difficulty}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {task.category}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🏆</span>
                  {task.xp} XP
                </span>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🕒</span>
                  {task.time}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span aria-hidden>🎮</span>
                  {task.solves} решений
                </span>
              </div>

              <Link
                to={`/task/${task.id}`}
                className="inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                {task.completed ? "Решить снова" : "Решить задачу"}
              </Link>
            </article>
          ))}
          {!isLoadingTasks && tasks.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Пока нет задач для выбранного фильтра.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
