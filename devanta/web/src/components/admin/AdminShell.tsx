import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-brand-500 text-white"
      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-900"
  }`;

/** Оболочка админки: только admin и moderator; у moderator нет пунктов «Пользователи» и «FAQ» в меню (API всё равно 403). */
export function AdminShell() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (role !== "admin" && role !== "moderator") {
    return <Navigate to="/dashboard" replace />;
  }

  const isAdmin = role === "admin";

  return (
    <div className="flex min-h-screen bg-[#F4F4F5] text-slate-800 dark:bg-black dark:text-neutral-100">
      <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-white px-3 py-6 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="mb-4 px-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Админка</p>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Админ-меню">
          <NavLink to="/admin" end className={navClass}>
            Обзор
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin/users" className={navClass}>
              Пользователи
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin/faq" className={navClass}>
              FAQ
            </NavLink>
          ) : null}
          <NavLink to="/admin/moderation" className={navClass}>
            Модерация отзывов
          </NavLink>
        </nav>
        <NavLink
          to="/dashboard"
          className="mt-auto rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-600 dark:border-neutral-800 dark:text-slate-300"
        >
          ← Личный кабинет
        </NavLink>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
