import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

// PNG для страницы «Рейтинг» (src/public/UI/Rating)
const ratingUi = {
  header: new URL("../public/UI/Rating/Rating.png", import.meta.url).href,
  tabTotal: new URL("../public/UI/Rating/SummaryRating.png", import.meta.url).href,
  tabWeek: new URL("../public/UI/Rating/WeeklyRating.png", import.meta.url).href,
  firstPlace: new URL("../public/UI/Rating/FirstPlace.png", import.meta.url).href,
  secondPlace: new URL("../public/UI/Rating/SecondPlace.png", import.meta.url).href,
  thirdPlace: new URL("../public/UI/Rating/ThirdPlace.png", import.meta.url).href,
} as const;

type PodiumPlace = "first" | "second" | "third";

/** Картинка из UI без лишней обводки; alt пустой — декоративные иконки рядом с текстом */
function UiImg({ src, className = "h-5 w-5", alt = "" }: { src: string; className?: string; alt?: string }) {
  return <img src={src} alt={alt} width={20} height={20} className={`shrink-0 object-contain ${className}`} />;
}

type LeaderboardUser = {
  name: string;
  xp: number;
  level: number;
  achievements: number;
  isMe?: boolean;
};

// Порядок колонок как в Figma: 2-е | 1-е | 3-е
const PODIUM_LAYOUT: { place: PodiumPlace; rankIndex: number; medalIcon: string }[] = [
  { place: "second", rankIndex: 1, medalIcon: ratingUi.secondPlace },
  { place: "first", rankIndex: 0, medalIcon: ratingUi.firstPlace },
  { place: "third", rankIndex: 2, medalIcon: ratingUi.thirdPlace },
];

function podiumCardClass(place: PodiumPlace): string {
  switch (place) {
    case "first":
      return "border-amber-400 bg-amber-50/90 dark:border-amber-500/50 dark:bg-amber-950/25 md:min-h-[22rem] md:pb-2";
    case "second":
      return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:min-h-[19rem]";
    case "third":
      return "border-brand-500/70 bg-white dark:border-brand-500/40 dark:bg-slate-900 md:min-h-[19rem]";
    default:
      return "";
  }
}

function levelBadgeClass(place: PodiumPlace): string {
  switch (place) {
    case "first":
      return "bg-brand-500 text-white dark:bg-brand-600";
    case "second":
      return "bg-slate-400 text-white dark:bg-slate-500";
    case "third":
      return "bg-orange-200 text-white dark:bg-orange-400/90 dark:text-white";
    default:
      return "bg-brand-500 text-white";
  }
}

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
          data.map((row) => ({
            name: row.name,
            xp: row.xp,
            level: row.level,
            achievements: row.achievements,
            isMe: row.isMe,
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
      <section className="flex gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 p-2 shadow-sm"
          aria-hidden
        >
          <UiImg src={ratingUi.header} className="h-9 w-9" alt="" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Рейтинг</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Соревнуйся с другими учениками</p>
        </div>
      </section>

      <section className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setTab("total")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "total" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
        >
          <UiImg src={ratingUi.tabTotal} className="h-5 w-5" alt="" />
          Общий рейтинг
        </button>
        <button
          type="button"
          onClick={() => setTab("week")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === "week" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
        >
          <UiImg src={ratingUi.tabWeek} className="h-5 w-5" alt="" />
          За неделю
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
        {PODIUM_LAYOUT.map(({ place, rankIndex, medalIcon }) => {
          const user = top3[rankIndex];
          if (!user) {
            return <div key={place} className="hidden min-h-0 md:block" aria-hidden />;
          }
          return (
            <article
              key={`${place}-${user.name}`}
              className={`flex flex-col rounded-2xl border p-5 text-center shadow-sm ${podiumCardClass(place)}`}
            >
              <div className="flex justify-center">
                <UiImg src={medalIcon} className="h-12 w-12 md:h-14 md:w-14" alt="" />
              </div>
              <h2 className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
              <p className="mt-2 flex justify-center">
                <span className={`inline-flex rounded-lg px-3 py-1 text-sm font-semibold ${levelBadgeClass(place)}`}>
                  Уровень {user.level}
                </span>
              </p>
              <p className="mt-4 text-5xl font-black text-brand-600 dark:text-brand-400">{user.xp} XP</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{user.achievements} достижений</p>
            </article>
          );
        })}
      </section>

      <section className="space-y-3">
        {rest.map((user, index) => (
          <article
            key={user.name}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex min-w-0 items-center gap-3">
              <p className="w-10 shrink-0 text-lg font-bold text-slate-500 dark:text-slate-400">#{index + 4}</p>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-white">
                  {user.name}{" "}
                  {user.isMe ? (
                    <span className="ml-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      Это ты!
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Уровень {user.level} <span className="mx-1">•</span> {user.achievements} достижений
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-4xl font-black leading-none text-brand-600 dark:text-brand-400">{user.xp}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">XP</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
