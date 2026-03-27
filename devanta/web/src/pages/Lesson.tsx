import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

type LessonPayload = {
  id: number;
  moduleId: number;
  title: string;
  content: string;
  videoUrl: string;
  sortOrder: number;
};

type LessonTask = { id: number; title: string; question: string; xpReward: number };

export function LessonPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<LessonPayload | null>(null);
  const [task, setTask] = useState<LessonTask | null>(null);
  const [step, setStep] = useState<"video" | "theory" | "quiz" | "task">("video");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .get<LessonPayload>(`/lessons/${id}`)
      .then(({ data }) => {
        if (!cancelled) setLesson(data);
      })
      .catch(() => {
        if (!cancelled) setLesson(null);
      });
    api
      .get<LessonTask>(`/lessons/${id}/task`)
      .then(({ data }) => {
        if (!cancelled) setTask(data);
      })
      .catch(() => {
        if (!cancelled) setTask(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const stepLabel = useMemo(
    () =>
      ({
        video: "Шаг 1: Видео",
        theory: "Шаг 2: Теория",
        quiz: "Шаг 3: Тест",
        task: "Шаг 4: Задание",
      })[step],
    [step]
  );
  const blockIndex = useMemo(() => {
    if (!lesson?.sortOrder) return 1;
    const lessonsPerBlock = 3;
    return Math.floor((lesson.sortOrder - 1) / lessonsPerBlock) + 1;
  }, [lesson?.sortOrder]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link to={lesson ? `/module/${lesson.moduleId}` : "/modules"} className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        ← Назад к модулю
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">{lesson?.title ?? `Урок #${id}`}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stepLabel} из учебного пайплайна: видео → теория → тест → задание</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => setStep("video")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${step === "video" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Видео</button>
          <button type="button" onClick={() => setStep("theory")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${step === "theory" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Теория</button>
          <button type="button" onClick={() => setStep("quiz")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${step === "quiz" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Тест</button>
          <button type="button" onClick={() => setStep("task")} className={`rounded-xl px-3 py-2 text-sm font-semibold ${step === "task" ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Задание</button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          {step === "video" ? (
            lesson?.videoUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Видео из БД:</p>
                <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                  Открыть видео →
                </a>
              </div>
            ) : (
              <p className="text-slate-700 dark:text-slate-300">Видео пока не задано.</p>
            )
          ) : null}
          {step === "theory" ? <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{lesson?.content || "Теоретический материал урока пока пуст."}</p> : null}
          {step === "quiz" ? (
            <Link to={lesson ? `/quiz/${lesson.moduleId}?block=${blockIndex}` : "/modules"} className="inline-flex rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              Перейти к тесту модуля
            </Link>
          ) : null}
          {step === "task" ? (
            task ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{task.question}</p>
                <Link to={`/task/${task.id}`} className="inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                  Открыть задачку (+{task.xpReward} XP)
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Задачка для этого блока пока не найдена.</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
