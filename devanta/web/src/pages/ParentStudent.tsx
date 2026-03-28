import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { mediaUrl } from "../lib/mediaUrl";
import { api } from "../services/api";

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

type ProgressResponse = {
  summary: Summary;
  activity: { title: string; time: string; xp: string }[];
};

export function ParentStudentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    let c = false;
    api
      .get<ProgressResponse>(`/parent/child/${studentId}/progress`)
      .then(({ data: d }) => {
        if (!c) setData(d);
      })
      .catch(() => {
        if (!c) setErr("Нет доступа или ученик не найден.");
      });
    return () => {
      c = true;
    };
  }, [studentId]);

  const s = data?.summary;

  if (err) {
    return (
      <div className="space-y-3">
        <p className="text-red-600">{err}</p>
        <Link to="/parent" className="text-brand-600 underline dark:text-brand-400">
          ← К списку
        </Link>
      </div>
    );
  }

  if (!s) {
    return <p className="text-slate-600 dark:text-slate-400">Загрузка…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/parent" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
          ← Назад
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          {s.avatarUrl?.trim() ? (
            <img src={mediaUrl(s.avatarUrl)} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white">
              {(s.fullName || s.username)[0] ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{s.fullName || s.username}</h1>
            <p className="text-slate-500 dark:text-slate-400">@{s.username}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500">Уровень</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.level}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500">XP</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.xp}</p>
          </div>
          <div className="rounded-xl bg-amber-50/80 px-3 py-2 dark:bg-amber-500/10">
            <p className="text-xs text-slate-500">Монеты</p>
            <p className="text-lg font-bold text-amber-900 dark:text-amber-200">{s.coins ?? 0}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500">Уроки</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.lessonsCompleted}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500">Задачи</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.tasksSolved}</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500">Достижения</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{s.achievements}</p>
          </div>
        </div>
      </div>

      {data.activity.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Активность</h2>
          <ul className="mt-3 space-y-2">
            {data.activity.map((ev, i) => (
              <li
                key={`${ev.time}-${i}`}
                className="flex justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60"
              >
                <span>{ev.title}</span>
                <span className="shrink-0 text-xs text-slate-500">{ev.time}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
