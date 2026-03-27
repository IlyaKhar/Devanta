import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

type LeaderboardUser = {
  name: string;
  xp: number;
  level: number;
  achievements: number;
  avatar: string;
  isMe?: boolean;
};

const avatars = ["👩‍🎓", "🧑‍💻", "👩‍💻", "👨‍🎓", "👩‍🔬", "🧑‍🔬", "👨‍💻", "🧑‍🎓"];

export function LeaderboardPage() {
  const [tab, setTab] = useState<"total" | "week">("total");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api
      .get<Array<{ name: string; xp: number; level: number; achievements: number; isMe?: boolean }>>(
        `/leaderboard?period=${tab}`,
      )
      .then(({ data }) => {
        if (cancelled) return;
        setUsers(
          data.map((row, index) => ({
            name: row.name,
            xp: row.xp,
            level: row.level,
            achievements: row.achievements,
            isMe: row.isMe,
            avatar: avatars[index % avatars.length] ?? "🧑‍💻",
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setUsers([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const displayUsers = useMemo(() => users, [users]);

  const top3 = displayUsers.slice(0, 3);
  const rest = displayUsers.slice(3);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <section>
        <h1 className="flex items-center gap-2 text-4xl font-black text-slate-900 dark:text-white">
          <span aria-hidden>🏆</span>
          Рейтинг
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Соревнуйся с другими учениками</p>
      </section>

      <section className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setTab("total")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "total" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
        >
          🏆 Общий рейтинг
        </button>
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "week" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
        >
          📈 За неделю
        </button>
      </section>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Обновляем рейтинг...
        </div>
      ) : null}
      {!isLoading && displayUsers.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Пока нет данных рейтинга.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {top3.map((user, index) => (
          <article
            key={user.name}
            className={`rounded-2xl border bg-white p-5 text-center shadow-sm dark:bg-slate-900 ${
              index === 0 ? "border-amber-300 dark:border-amber-500/40" : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <p className="text-4xl">{index === 0 ? "👑" : "🏅"}</p>
            <p className="mt-2 text-4xl">{user.avatar}</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
            <p className="mt-1 inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              Уровень {user.level}
            </p>
            <p className="mt-4 text-5xl font-black text-brand-600 dark:text-brand-400">{user.xp} XP</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.achievements} достижений</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        {rest.map((user, index) => (
          <article
            key={user.name}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <p className="w-10 text-lg font-bold text-slate-500 dark:text-slate-400">#{index + 4}</p>
              <p className="text-2xl">{user.avatar}</p>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {user.name} {user.isMe ? <span className="ml-2 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">Это ты!</span> : null}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Уровень {user.level} · {user.achievements} достижений</p>
              </div>
            </div>
            <p className="text-right text-4xl font-black text-brand-600 dark:text-brand-400">
              {user.xp}
              <span className="ml-2 text-sm font-semibold text-slate-500 dark:text-slate-400">XP</span>
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
