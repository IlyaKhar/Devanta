import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

type TaskPayload = {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  question: string;
  xpReward: number;
};

export function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    api
      .get<TaskPayload>(`/tasks/${id}`)
      .then(({ data }) => {
        if (!cancelled) setTask(data);
      })
      .catch(() => {
        if (!cancelled) setTask(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        ← Назад
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Загружаем задачку...</p> : null}
        {!isLoading && !task ? <p className="text-sm text-slate-500 dark:text-slate-400">Задача не найдена.</p> : null}
        {task ? (
          <>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{task.title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{task.question}</p>
            <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">Награда: +{task.xpReward} XP</p>
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Редактор кода и отправка решения - следующим шагом.</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
