import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-sm ${className}`}
      aria-hidden
    >
      &lt;/&gt;
    </div>
  );
}

/** Оболочка личного кабинета: боковая навигация + контент (макет «Главная» и др.). */
export function DashboardLayout() {
  const navigate = useNavigate();
  const clearToken = useAuthStore((s) => s.logout);
  const [xp, setXp] = useState<number | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [logoutLoading, setLogoutLoading] = useState(false);
  const avatarLetter = "У";

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ xp: number }>("/progress")
      .then(({ data }) => {
        if (!cancelled) setXp(data.xp);
      })
      .catch(() => {
        if (!cancelled) setXp(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function handleLogout() {
    setLogoutLoading(true);
    try {
      await api.post("/auth/logout");
    } finally {
      clearToken();
      navigate("/login", { replace: true });
      setLogoutLoading(false);
    }
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-center gap-2 px-1">
          <LogoMark />
          <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">Devanta</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Основное меню">
          <NavLink to="/dashboard" end className={navClass}>
            <span className="text-lg" aria-hidden>
              ⌂
            </span>
            Главная
          </NavLink>
          <NavLink to="/modules" className={navClass}>
            <span className="text-lg" aria-hidden>
              📚
            </span>
            Модули
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            <span className="text-lg" aria-hidden>
              🏆
            </span>
            Задачи
          </NavLink>
          <NavLink to="/leaderboard" className={navClass}>
            <span className="text-lg" aria-hidden>
              👥
            </span>
            Рейтинг
          </NavLink>
        </nav>

        <div className="mt-auto space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <span aria-hidden>✦</span>
            AI Ассистент
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-60 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {logoutLoading ? "Выходим…" : "Выйти"}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-slate-200/80 bg-white/90 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={dark ? "Светлая тема" : "Тёмная тема"}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
            <span aria-hidden>🏆</span>
            {xp != null ? `${xp} XP` : "… XP"}
          </div>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-inner transition hover:scale-105"
            aria-label="Открыть личный кабинет"
          >
            {avatarLetter}
          </button>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Открыть настройки"
          >
            ⚙️
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
