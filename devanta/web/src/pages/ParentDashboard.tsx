import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type ChildItem = {
  studentUserId: number;
  studentName: string;
  connectedAt: string;
};

export function ParentDashboardPage() {
  const [items, setItems] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    setLoading(true);
    api
      .get<{ items: ChildItem[] }>("/parent/children")
      .then(({ data }) => {
        if (!c) setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => {
        if (!c) setErr("Не удалось загрузить список.");
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  if (loading) {
    return <p className="text-slate-600 dark:text-slate-400">Загрузка…</p>;
  }

  if (err) {
    return <p className="text-red-600">{err}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Пока никого не привязали</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Попроси ребёнка отправить ссылку из профиля или вставь её на странице{" "}
          <Link to="/parent/link" className="font-semibold text-brand-600 underline dark:text-brand-400">
            «Вставить ссылку»
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Дети</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((ch) => (
          <li key={ch.studentUserId}>
            <Link
              to={`/parent/student/${ch.studentUserId}`}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <span className="text-lg font-bold text-slate-900 dark:text-white">{ch.studentName}</span>
              <span className="mt-1 text-xs text-slate-500">Связь с {new Date(ch.connectedAt).toLocaleString()}</span>
              <span className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">Открыть прогресс →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
