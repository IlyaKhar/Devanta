import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

type Summary = {
  fullName: string;
  username: string;
  xp: number;
  level: number;
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
  const [parentContact, setParentContact] = useState("");
  const [isConnectingParent, setIsConnectingParent] = useState(false);
  const xp = summary?.xp ?? 0;
  const currentLevel = summary?.level ?? 0;
  const nextLevelXP = Math.max(100, (currentLevel + 1) * 100);
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXP) * 100));
  const fallbackInviteLink = `${window.location.origin}/parent/connect?student=alex_codes`;
  const actualInviteLink = inviteLink || fallbackInviteLink;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(actualInviteLink)}`;

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
        setInviteNotice("Не удалось получить защищенную ссылку, использую базовую.");
      })
      .finally(() => setIsInviteLoading(false));
  }, [tab, inviteLink, isInviteLoading]);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(actualInviteLink);
      setInviteNotice("Ссылка скопирована.");
    } catch {
      setInviteNotice("Не удалось скопировать ссылку.");
    }
  }

  async function shareInviteLink() {
    if (!navigator.share) {
      setInviteNotice("Поделиться можно через копирование ссылки.");
      return;
    }
    try {
      await navigator.share({
        title: "Devanta — подключение родителя",
        text: "Подключись к прогрессу ученика в Devanta",
        url: actualInviteLink,
      });
      setInviteNotice("Ссылка отправлена.");
    } catch {
      setInviteNotice("Не удалось открыть меню поделиться.");
    }
  }

  async function connectParent() {
    if (!inviteLink) {
      setInviteNotice("Сначала дождись генерации защищенной ссылки.");
      return;
    }
    const token = new URL(inviteLink).searchParams.get("token") ?? "";
    if (!token) {
      setInviteNotice("В ссылке нет токена подключения.");
      return;
    }
    if (!parentContact.trim()) {
      setInviteNotice("Укажи email или контакт родителя.");
      return;
    }
    setIsConnectingParent(true);
    try {
      await api.get(`/parent/connect?token=${encodeURIComponent(token)}&parent=${encodeURIComponent(parentContact.trim())}`);
      setInviteNotice("Родитель успешно подключен.");
      setParentContact("");
    } catch {
      setInviteNotice("Не удалось подключить родителя.");
    } finally {
      setIsConnectingParent(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${
            tab === "overview"
              ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
              : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          }`}
        >
          📊 Обзор и достижения
        </button>
        <button
          type="button"
          onClick={() => setTab("parent")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${
            tab === "parent"
              ? "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700"
              : "bg-slate-100 text-slate-500 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          }`}
        >
          🛡 Родительский контроль
        </button>
      </div>
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-4xl">🧑‍💻</div>
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
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ⚙️ Настройки профиля
            </button>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Статистика</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-slate-600 dark:text-slate-300"><span>📘 Уроков завершено</span><b>{summary?.lessonsCompleted ?? 0}</b></li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300"><span>🧩 Задач решено</span><b>{summary?.tasksSolved ?? 0}</b></li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300"><span>🎯 Достижений</span><b>{summary?.achievements ?? 0}</b></li>
              <li className="flex justify-between text-slate-600 dark:text-slate-300"><span>📈 Всего XP</span><b>{xp}</b></li>
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
                Пригласи родителей, чтобы они могли отслеживать твой прогресс
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  📋 Копировать ссылку
                </button>
                <button
                  type="button"
                  onClick={shareInviteLink}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  🔗 Поделиться
                </button>
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                {isInviteLoading ? "Генерирую защищенную ссылку..." : actualInviteLink}
              </div>
              {inviteNotice ? (
                <p className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">{inviteNotice}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="Email родителя для принятия"
                  className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={connectParent}
                  disabled={isConnectingParent}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isConnectingParent ? "Подключаю..." : "Подтвердить подключение"}
                </button>
              </div>
              <div className="mt-4 inline-flex rounded-2xl bg-white p-3 shadow-sm dark:bg-slate-900">
                <img src={qrImageUrl} alt="QR-код для подключения родителя" className="h-56 w-56 rounded-xl object-contain" />
              </div>
            </article>
          </section>
        )}
      </div>
    </div>
  );
}
