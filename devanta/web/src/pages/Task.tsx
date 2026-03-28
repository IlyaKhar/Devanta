import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, getAxiosErrorMessage } from "../services/api";

type TaskPayload = {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  question: string;
  xpReward: number;
  language?: string;
  starterCode?: string;
  hints?: string[];
  needsCodeCheck?: boolean;
  /** Урок уже сдан — XP/монеты за повтор не даём */
  lessonCompleted?: boolean;
  coinsOnFirstSolve?: number;
};

export function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskPayload | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastCoins, setLastCoins] = useState(0);
  const [lastXpGranted, setLastXpGranted] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setLastCoins(0);
    setLastXpGranted(false);
    api
      .get<TaskPayload>(`/tasks/${id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setTask(data);
          setCode((data.starterCode ?? "").trimEnd() ? data.starterCode ?? "" : "");
        }
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

  async function submit() {
    if (!task || !id) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await api.post<{
        accepted?: boolean;
        xp?: number;
        coinsEarned?: number;
        firstSolve?: boolean;
        xpGranted?: boolean;
        message?: string;
      }>(`/tasks/${id}/submit`, {
        code: code.trim(),
      });
      if (data.accepted) {
        setSuccess(true);
        setLastCoins(typeof data.coinsEarned === "number" ? data.coinsEarned : 0);
        setLastXpGranted(Boolean(data.xpGranted));
      } else {
        setError(data.message ?? "Ответ не принят.");
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const ax = err as { response?: { data?: { message?: string } } };
        const m = ax.response?.data?.message;
        if (typeof m === "string" && m.trim()) {
          setError(m);
        } else {
          setError(getAxiosErrorMessage(err, "Ошибка отправки."));
        }
      } else {
        setError(getAxiosErrorMessage(err, "Ошибка отправки."));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const showEditor = Boolean(task?.needsCodeCheck || task?.type === "code");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        ← Назад
      </button>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Загружаем задачу…</p> : null}
        {!isLoading && !task ? <p className="text-sm text-slate-500 dark:text-slate-400">Задача не найдена.</p> : null}
        {task ? (
          <>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{task.title}</h1>
            <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">{task.question}</p>
            <p className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400">
              Награда: +{task.xpReward} XP
              {!task.lessonCompleted && typeof task.coinsOnFirstSolve === "number" ? (
                <span className="ml-2 text-amber-700 dark:text-amber-300"> · +{task.coinsOnFirstSolve} монет за первое решение</span>
              ) : null}
              {task.lessonCompleted ? (
                <span className="ml-2 text-slate-500 dark:text-slate-400">(повтор — без XP и монет)</span>
              ) : null}
            </p>

            {task.hints && task.hints.length > 0 ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setHintsOpen((v) => !v)}
                  className="text-sm font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
                >
                  {hintsOpen ? "Скрыть подсказки" : `Подсказки (${task.hints.length})`}
                </button>
                {hintsOpen ? (
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {task.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ) : null}

            {showEditor ? (
              <div className="mt-6 space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Код ({task.language ?? "javascript"})
                </label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-950 p-3 font-mono text-sm text-slate-100 outline-none ring-brand-500/40 focus:ring-2 dark:border-slate-700"
                  placeholder="// твой код"
                />
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">Для этой задачи проверка на сервере не настроена — можно сдать без кода.</p>
            )}

            {error ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </p>
            ) : null}

            {success ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                <p className="font-semibold">
                  Зачтено!
                  {lastXpGranted ? ` +${task.xpReward} XP` : " (повторное решение)"}
                  {lastCoins > 0 ? ` · +${lastCoins} монет` : ""}
                </p>
                <Link
                  to={`/lesson/${task.lessonId}`}
                  className="mt-2 inline-block font-semibold text-brand-700 underline dark:text-brand-300"
                >
                  Вернуться к уроку →
                </Link>
              </div>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || (showEditor && !code.trim())}
                onClick={() => void submit()}
                className="mt-6 w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {isSubmitting ? "Проверяем…" : task.needsCodeCheck ? "Отправить на проверку" : "Сдать задачу"}
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
