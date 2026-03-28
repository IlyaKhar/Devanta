import { Link } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export function AdminDashboardPage() {
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Панель администратора</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Твоя роль: <b>{role}</b>. Здесь только админ-разделы; курсы, задачи и рейтинг — в ученическом кабинете (ссылка «Личный кабинет» внизу слева).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {isAdmin ? (
          <Link
            to="/admin/users"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Пользователи</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Список, блокировка, роли</p>
          </Link>
        ) : null}
        {isAdmin ? (
          <Link
            to="/admin/faq"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
          >
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">FAQ</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Контент страницы помощи</p>
          </Link>
        ) : null}
        <Link
          to="/admin/moderation"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Модерация</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Очередь отзывов (когда API подключат к БД)</p>
        </Link>
      </div>
    </div>
  );
}
