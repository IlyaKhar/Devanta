import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { decodeJwtPayload } from "../lib/jwtPayload";
import { api, getAxiosErrorMessage } from "../services/api";
import { useAuthStore } from "../store/auth";

type AdminUserRow = {
  id: number;
  email: string;
  fullName: string;
  username: string;
  role: string;
  blocked: boolean;
  age: number;
  coins: number;
  createdAt: string;
};

const ROLES = ["student", "parent", "moderator", "admin"] as const;

export function AdminUsersPage() {
  const role = useAuthStore((s) => s.role);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const myId = useMemo(() => {
    const p = accessToken ? decodeJwtPayload(accessToken) : null;
    return typeof p?.sub === "number" ? p.sub : undefined;
  }, [accessToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { data } = await api.get<AdminUserRow[]>("/admin/users");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Не удалось загрузить пользователей"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setBlocked(userId: number, blocked: boolean) {
    setBusyId(userId);
    setNotice(null);
    try {
      await api.post("/admin/block", { userId, blocked });
      setNotice(blocked ? `Пользователь #${userId} заблокирован` : `Пользователь #${userId} разблокирован`);
      await load();
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Ошибка блокировки"));
    } finally {
      setBusyId(null);
    }
  }

  async function setRole(userId: number, newRole: string) {
    setBusyId(userId);
    setNotice(null);
    try {
      await api.post("/admin/role", { userId, role: newRole });
      setNotice(`Роль пользователя #${userId} обновлена`);
      await load();
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Ошибка смены роли"));
    } finally {
      setBusyId(null);
    }
  }

  if (role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Пользователи</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Блокировка и роли (без смены пароля)</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
        >
          Обновить
        </button>
      </div>

      {notice ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {notice}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {loading ? <p className="p-4 text-sm text-slate-500">Загрузка…</p> : null}
        {!loading && rows.length === 0 ? <p className="p-4 text-sm text-slate-500">Список пуст или нет доступа.</p> : null}
        {!loading && rows.length > 0 ? (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Имя</th>
                <th className="px-3 py-2">Роль</th>
                <th className="px-3 py-2">Монеты</th>
                <th className="px-3 py-2">Статус</th>
                <th className="px-3 py-2">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((u) => {
                const isSelf = myId !== undefined && u.id === myId;
                return (
                  <tr key={u.id} className={u.blocked ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <td className="px-3 py-2 font-mono text-xs">{u.id}</td>
                    <td className="max-w-[180px] truncate px-3 py-2">{u.email}</td>
                    <td className="max-w-[140px] truncate px-3 py-2">{u.fullName || u.username || "—"}</td>
                    <td className="px-3 py-2">
                      <RoleSelect
                        value={u.role}
                        disabled={busyId === u.id || isSelf}
                        onSave={(r) => void setRole(u.id, r)}
                      />
                    </td>
                    <td className="px-3 py-2">{u.coins ?? 0}</td>
                    <td className="px-3 py-2">{u.blocked ? <span className="text-red-600 dark:text-red-400">Заблокирован</span> : "Ок"}</td>
                    <td className="px-3 py-2">
                      {isSelf ? (
                        <span className="text-xs text-slate-400">это ты</span>
                      ) : (
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => void setBlocked(u.id, !u.blocked)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            u.blocked
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-600"
                          } disabled:opacity-50`}
                        >
                          {u.blocked ? "Разблокировать" : "Блокировать"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

function RoleSelect({ value, disabled, onSave }: { value: string; disabled: boolean; onSave: (r: string) => void }) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    setLocal(value);
  }, [value]);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <select
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(e.target.value)}
        className="max-w-[130px] rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {local !== value ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSave(local)}
          className="rounded-lg bg-brand-500 px-2 py-1 text-xs font-semibold text-white hover:bg-brand-600"
        >
          OK
        </button>
      ) : null}
    </div>
  );
}
