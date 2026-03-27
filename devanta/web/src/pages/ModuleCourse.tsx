import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

type LessonItem = { id: number; title: string; duration: string; completed: boolean; status: string };
type ModuleCourseData = {
  id: number;
  title: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  level: string;
  progress: number;
  totalXp: number;
  lessons: LessonItem[];
};

export function ModuleCoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState<ModuleCourseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    api
      .get<ModuleCourseData>(`/modules/${id}/course`)
      .then(({ data }) => {
        if (!cancelled) setCourse(data);
      })
      .catch(() => {
        if (!cancelled) setCourse(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const { lessonGroups, finalLesson } = useMemo(() => {
    if (!course) return { lessonGroups: [] as LessonItem[][], finalLesson: null as LessonItem | null };
    const final = course.lessons.find((l) => l.title === "Итоговое занятие") ?? null;
    const regularLessons = course.lessons.filter((l) => l.title !== "Итоговое занятие");
    const chunkSize = 3;
    const groups: LessonItem[][] = [];
    for (let i = 0; i < regularLessons.length; i += chunkSize) groups.push(regularLessons.slice(i, i + chunkSize));
    return { lessonGroups: groups, finalLesson: final };
  }, [course]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Link to="/modules" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
        ← Назад к курсам
      </Link>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-5 text-white">
          <h1 className="mt-8 text-4xl font-black leading-none">{course?.title ?? "Модуль курса"}</h1>
          <p className="mt-2 text-sm text-slate-200">{course?.description ?? "Загрузка описания..."}</p>
        </div>
        <div className="grid gap-2 border-t border-slate-100 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:grid-cols-5">
          <span>📖 Уровень: <b>{course?.level ?? "С нуля"}</b></span>
          <span>⏱ Длительность: <b>{course?.duration ?? "—"}</b></span>
          <span>📈 Учеников: <b>{course?.students ?? 0}</b></span>
          <span>⭐ Рейтинг: <b>{course?.rating.toFixed(1) ?? "4.8"} / 5.0</b></span>
          <span>✅ Прогресс: <b>{course?.progress ?? 0}%</b></span>
        </div>
        <div className="px-4 pb-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Общий прогресс курса</span>
            <span>{course?.progress ?? 0}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${course?.progress ?? 0}%` }} />
          </div>
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Блоки курса</h2>
        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Загружаем модуль курса...
          </div>
        ) : null}
        {!isLoading && !course ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Не удалось загрузить модуль.
          </div>
        ) : null}
        {lessonGroups.map((lessons, index) => {
          const blockLocked = lessons.every((lesson) => lesson.status === "locked");
          return (
            <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{index + 1}. Учебный блок</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">В каждом уроке: видео → теория → тест → задание</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">🧩 {lessons.length} уроков · 🏆 {lessons.length * 50} XP</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-brand-500">
                    {Math.round((lessons.filter((x) => x.completed).length / Math.max(lessons.length, 1)) * 100)}%
                  </p>
                  <div className="mt-1 h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-slate-900 dark:bg-white"
                      style={{ width: `${Math.round((lessons.filter((x) => x.completed).length / Math.max(lessons.length, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {lessons.map((lesson) =>
                  lesson.status === "locked" ? (
                    <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      <span>🔒 {lesson.title}</span>
                      <span>{lesson.duration}</span>
                    </div>
                  ) : (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <span>
                        {lesson.status === "completed" ? "✅" : lesson.status === "in_progress" ? "🟡" : "▶"} {lesson.title}
                      </span>
                      <span className="text-slate-400">{lesson.duration}</span>
                    </Link>
                  )
                )}
                {blockLocked ? (
                  <div className="mt-2 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    Тест заблокирован до прохождения предыдущего блока
                  </div>
                ) : (
                  <Link to={`/quiz/${course?.id ?? id}?block=${index + 1}`} className="mt-2 block w-full rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-600">
                    🏆 Пройти тест по блоку
                  </Link>
                )}
              </div>
            </article>
          );
        })}
        {course && finalLesson ? (
          <article className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">11. Итоговое занятие</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Финальный блок откроется после прохождения блока 10.
                </p>
              </div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {finalLesson.status === "locked" ? "🔒 Заблокировано" : finalLesson.completed ? "✅ Завершено" : "▶ Доступно"}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {finalLesson.status === "locked" ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
                  Доступно после теста блока 10
                </div>
              ) : (
                <Link
                  to={`/lesson/${finalLesson.id}`}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Открыть итоговый урок
                </Link>
              )}
              {finalLesson.status === "locked" ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500">
                  Итоговый тест заблокирован
                </div>
              ) : (
                <Link
                  to={`/quiz/${course.id}?block=11`}
                  className="rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-600"
                >
                  🏆 Пройти итоговый тест
                </Link>
              )}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
