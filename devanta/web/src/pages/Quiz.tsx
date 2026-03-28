import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
};

type QuizPayload = {
  moduleId: number;
  blockIndex: number;
  lessonInBlock: number;
  passThreshold: number;
  questions: QuizQuestion[];
};

type QuizResult = {
  blockIndex: number;
  lessonInBlock?: number;
  passed: boolean;
  scorePercent: number;
  correct: number;
  total: number;
  passThreshold: number;
  xp: number;
};

export function QuizPage() {
  const { moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const blockIndex = Number(new URLSearchParams(location.search).get("block") || "1");
  const lessonInBlock = Number(new URLSearchParams(location.search).get("lesson") || "1");
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!moduleId) return;
    let cancelled = false;
    setIsLoading(true);
    api
      .get<QuizPayload>(`/quiz/${moduleId}?block=${blockIndex}&lesson=${lessonInBlock}`)
      .then(({ data }) => {
        if (!cancelled) {
          setQuiz(data);
          setAnswers({});
          setIndex(0);
          setResult(null);
        }
      })
      .catch(() => {
        if (!cancelled) setQuiz(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId, blockIndex, lessonInBlock]);

  const current = useMemo(() => quiz?.questions[index] ?? null, [quiz, index]);
  const progress = quiz ? Math.round(((index + 1) / quiz.questions.length) * 100) : 0;

  async function submitQuiz() {
    if (!moduleId || !quiz) return;
    const payload: Record<string, number> = {};
    Object.entries(answers).forEach(([k, v]) => {
      payload[k] = v;
    });
    setIsSubmitting(true);
    try {
      const { data } = await api.post<QuizResult>(`/quiz/${moduleId}/submit?block=${blockIndex}&lesson=${lessonInBlock}`, { answers: payload });
      setResult(data);
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartQuiz() {
    setAnswers({});
    setIndex(0);
    setResult(null);
  }

  if (isLoading)
    return <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Загружаем тест...</div>;

  if (!quiz)
    return <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Тест не найден.</div>;

  if (result) {
    return (
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-4xl ${result.passed ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"}`}>
          {result.passed ? "✓" : "✕"}
        </div>
        <h1 className="mt-4 text-5xl font-black text-slate-900 dark:text-white">{result.passed ? "Отличный результат!" : "Попробуйте еще раз"}</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
          {result.passed ? `Порог ${result.passThreshold}% пройден, модуль засчитан.` : `Нужно набрать минимум ${result.passThreshold}% для прохождения`}
        </p>
        <p className={`mt-4 text-7xl font-black ${result.passed ? "text-emerald-500" : "text-brand-500"}`}>{result.scorePercent}%</p>
        <p className="mt-2 text-xl text-slate-600 dark:text-slate-300">Правильных ответов: {result.correct} из {result.total}</p>
        {result.passed ? <p className="mt-2 text-sm font-semibold text-brand-600 dark:text-brand-400">+{result.xp} XP начислено</p> : null}
        <div className="mt-6 flex justify-center gap-3">
          {!result.passed ? (
            <button type="button" onClick={restartQuiz} className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              Пройти снова
            </button>
          ) : null}
          <button type="button" onClick={() => navigate(`/module/${moduleId}`)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            К урокам
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link to={`/module/${moduleId}`} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">← Назад к модулю</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-brand-500">
            Блок {quiz.blockIndex}
            {quiz.lessonInBlock ? ` · урок ${quiz.lessonInBlock}` : ""}
          </span>
          <span>Вопрос {index + 1} из {quiz.questions.length}</span>
          <span className="font-semibold text-brand-500">{progress}%</span>
        </div>
        <div className="mb-6 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-2 rounded-full bg-slate-900 dark:bg-white" style={{ width: `${progress}%` }} />
        </div>
        {current ? (
          <>
            <h1 className="mb-5 text-4xl font-black text-slate-900 dark:text-white">{current.question}</h1>
            <div className="space-y-2">
              {current.options.map((option, optionIdx) => {
                const active = answers[current.id] === optionIdx;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [current.id]: optionIdx }))}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-lg transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-slate-900 dark:border-brand-400 dark:bg-brand-500/10 dark:text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={answers[current.id] === undefined || isSubmitting}
              onClick={() => {
                if (index === quiz.questions.length - 1) {
                  submitQuiz();
                  return;
                }
                setIndex((prev) => prev + 1);
              }}
              className="mt-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-brand-600"
            >
              {index === quiz.questions.length - 1 ? "Завершить тест" : "Следующий вопрос"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
