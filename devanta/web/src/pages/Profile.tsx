import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../lib/mediaUrl";
import { api } from "../services/api";

// Иконки страницы «Профиль» (src/public/UI/Profile)
const profileUi = {
  overviewTab: new URL("../public/UI/Profile/review and achievments.png", import.meta.url).href,
  parentTab: new URL("../public/UI/Profile/parentsControl.png", import.meta.url).href,
  avatar: new URL("../public/UI/Profile/CompletedATask.png", import.meta.url).href,
  settings: new URL("../public/UI/Profile/settings.png", import.meta.url).href,
  lessonsStat: new URL("../public/UI/Profile/LessonsCompleted.png", import.meta.url).href,
  tasksStat: new URL("../public/UI/Profile/TasksCompleted.png", import.meta.url).href,
  achievementsStat: new URL("../public/UI/Profile/Achievments.png", import.meta.url).href,
  totalXpStat: new URL("../public/UI/Profile/TotalEXP.png", import.meta.url).href,
  copyLink: new URL("../public/UI/Profile/CopyLink.png", import.meta.url).href,
  share: new URL("../public/UI/Profile/Share.png", import.meta.url).href,
} as const;

function ProfileUiImg({ src, className = "h-5 w-5" }: { src: string; className?: string }) {
  return <img src={src} alt="" width={20} height={20} className={`shrink-0 object-contain ${className}`} aria-hidden />;
}

type Summary = {
  fullName: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  coins?: number;
  tasksSolved: number;
  lessonsCompleted: number;
  achievements: number;
};

type ActivityItem = { title: string; time: string; xp: string };
type AchievementItem = { title: string; code: string; date: string };

export function ProfilePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [achievementItems, setAchievementItems] = useState<AchievementItem[]>([]);
  const [tab, setTab] = useState<"overview" | "parent">("overview");
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [isInviteLoading, setIsInviteLoading] = useState(false);
  const [parentConnections, setParentConnections] = useState<{ parentUserId: number; parentEmail: string; connectedAt: string }[]>([]);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  const xp = summary?.xp ?? 0;
  const currentLevel = summary?.level ?? 0;
  const nextLevelXP = Math.max(100, (currentLevel + 1) * 100);
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXP) * 100));
  const qrImageUrl = inviteLink
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(inviteLink)}`
    : "";

  useEffect(() => {
    let cancelled = false;
    api
      .get<Summary>("/me/summary")
      .then(({ data }) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => undefined);
    api
      .get<ActivityItem[]>("/me/activity")
      .then(({ data }) => {
        if (!cancelled) setActivity(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setActivity([]);
      });
    api
      .get<AchievementItem[]>("/me/achievements")
      .then(({ data }) => {
        if (!cancelled) setAchievementItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setAchievementItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (tab !== "parent" || inviteLink || isInviteLoading) return;
    setIsInviteLoading(true);
    api
      .get<{ inviteLink: string }>("/parent/invite")
      .then(({ data }) => {
        if (data.inviteLink) setInviteLink(data.inviteLink);
      })
      .catch(() => {
        setInviteNotice("Не удалось сгенерировать ссылку-приглашение. Проверь API и перезайди на вкладку.");
      })
      .finally(() => setIsInviteLoading(false));
  }, [tab, inviteLink, isInviteLoading]);

  useEffect(() => {
    if (tab !== "parent") return;
    setIsConnectionsLoading(true);
    api
      .get<{ items: { parentUserId: number; parentEmail: string; connectedAt: string }[] }>("/parent/connections")
      .then(({ data }) => setParentConnections(Array.isArray(data.items) ? data.items : []))
      .catch(() => setParentConnections([]))
      .finally(() => setIsConnectionsLoading(false));
  }, [tab, inviteLink]);

  async function copyInviteLink() {
    if (!inviteLink) {
      setInviteNotice("Ссылка ещё не готова — подожди секунду.");
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      setInviteNotice("Ссылка скопирована.");
    } catch {
      setInviteNotice("Не удалось скопировать ссылку.");
    }
  }

  async function shareInviteLink() {
    if (!inviteLink) {
      setInviteNotice("Ссылка ещё не готова.");
      return;
    }
    if (!navigator.share) {
      setInviteNotice("Поделиться можно через копирование ссылки.");
      return;
    }
    try {
      await navigator.share({
        title: "Devanta - подключение родителя",
        text: "Подключись к прогрессу ученика в Devanta",
        url: inviteLink,
      });
      setInviteNotice("Ссылка отправлена.");
    } catch {
      setInviteNotice("Не удалось открыть меню поделиться.");
    }
  }

  async function revokeParent(parentUserId: number) {
    try {
      await api.delete(`/parent/connections?parentUserId=${encodeURIComponent(String(parentUserId))}`);
      setParentConnections((prev) => prev.filter((p) => p.parentUserId !== parentUserId));
      setInviteNotice("Доступ для этого аккаунта родителя отключён.");
    } catch {
      setInviteNotice("Не удалось отключить родителя.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${tab === "overview"
            ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
            : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <ProfileUiImg src={profileUi.overviewTab} className="h-5 w-5" />
            Обзор и достижения
          </span>
        </button>
        <button
          type="button"
          onClick={() => setTab("parent")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${tab === "parent"
            ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
            : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <ProfileUiImg src={profileUi.parentTab} className="h-5 w-5" />
            Родительский контроль
          </span>
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100 ring-2 ring-brand-200/60 dark:bg-neutral-900 dark:ring-neutral-700">
              {summary?.avatarUrl?.trim() ? (
                <img
                  src={mediaUrl(summary.avatarUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                  key={summary.avatarUrl.trim()}
                />
              ) : (
                <ProfileUiImg src={profileUi.avatar} className="h-11 w-11" />
              )}
            </div>
            <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">{summary?.fullName?.trim() || "Ученик"}</h1>
            <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">@{summary?.username?.trim() || "user"}</p>
            <div className="mt-4 flex justify-center"><span className="rounded-lg bg-brand-500 px-3 py-1 text-sm font-semibold text-white">Уровень {currentLevel}</span></div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Прогресс уровня</span><span className="font-semibold text-brand-600 dark:text-brand-400">{xp}/{nextLevelXP} XP</span></div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${progressPercent}%` }} /></div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{Math.max(0, nextLevelXP - xp)} XP до следующего уровня</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ProfileUiImg src={profileUi.settings} className="h-5 w-5" />
              Настройки профиля
            </button>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Статистика</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <ProfileUiImg src={profileUi.lessonsStat} className="h-5 w-5" />
                  Уроков завершено
                </span>
                <b>{summary?.lessonsCompleted ?? 0}</b>
              </li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <ProfileUiImg src={profileUi.tasksStat} className="h-5 w-5" />
                  Задач решено
                </span>
                <b>{summary?.tasksSolved ?? 0}</b>
              </li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <ProfileUiImg src={profileUi.achievementsStat} className="h-5 w-5" />
                  Достижений
                </span>
                <b>{summary?.achievements ?? 0}</b>
              </li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <ProfileUiImg src={profileUi.totalXpStat} className="h-5 w-5" />
                  Всего XP
                </span>
                <b>{xp}</b>
              </li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">🪙 Монеты Devanta</span>
                <b>{summary?.coins ?? 0}</b>
              </li>
            </ul>
          </article>
        </section>
        {tab === "overview" ? (
          <section className="space-y-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Последняя активность</h2>
              {activity.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Пока нет активности.</p>
              ) : (
                <ul className="space-y-2">
                  {activity.map((event) => (
                    <li key={`${event.title}-${event.time}-${event.xp}`} className="flex items-start justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{event.time}</p>
                      </div>
                      <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">{event.xp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Твои достижения</h2>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Получено: {summary?.achievements ?? 0}</p>
              {achievementItems.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Достижений пока нет.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {achievementItems.map((item) => (
                    <div key={item.code + item.date} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.date}</p>
                      <div className="mt-2 inline-flex rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                        {item.code}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        ) : (
          <section className="space-y-4">
            <article className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm dark:border-blue-500/30 dark:bg-blue-500/5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Подключение родителей</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Отправь ссылку родителю — ему нужен аккаунт «родитель»; по ссылке привязка к его логину и прогресс в ЛК.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ProfileUiImg src={profileUi.copyLink} className="h-5 w-5" />
                  Копировать ссылку
                </button>
                <button
                  type="button"
                  onClick={shareInviteLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ProfileUiImg src={profileUi.share} className="h-5 w-5" />
                  Поделиться
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs break-all text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                {isInviteLoading ? "Генерирую ссылку-приглашение..." : inviteLink || "Ссылка появится здесь после загрузки."}
              </div>
              {inviteNotice ? (
                <p className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">{inviteNotice}</p>
              ) : null}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Подключённые родители</h3>
                {isConnectionsLoading ? (
                  <p className="mt-2 text-sm text-slate-500">Загрузка...</p>
                ) : parentConnections.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Пока никто не подтвердил приглашение.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {parentConnections.map((p) => (
                      <li
                        key={p.parentUserId}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      >
                        <span className="text-slate-800 dark:text-slate-200">{p.parentEmail}</span>
                        <button
                          type="button"
                          onClick={() => revokeParent(p.parentUserId)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          Отключить
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {qrImageUrl ? (
                <div className="mt-4 inline-flex rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                  <img src={qrImageUrl} alt="QR-код: ссылка для родителя" className="h-56 w-56 rounded-xl object-contain" />
                </div>
              ) : null}
            </article>
          </section>
        )}
      </div>
    </div>
  );
}
