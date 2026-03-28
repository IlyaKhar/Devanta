import { Link, Outlet } from "react-router-dom";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/auth";

/** Минимальная оболочка ЛК родителя (без сайдбара курсов). */
export function ParentShell() {
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* нет cookie — ок */
    }
    logout();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link to="/parent" className="text-lg font-black text-brand-600 dark:text-brand-400">
            Devanta · Родитель
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link to="/parent" className="hover:text-brand-600 dark:hover:text-brand-400">
              Мои дети
            </Link>
            <Link to="/parent/link" className="hover:text-brand-600 dark:hover:text-brand-400">
              Вставить ссылку
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Выйти
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
