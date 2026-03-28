import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

// Иконки страницы курса (src/public/UI — подбираем по смыслу)
const moduleCourseUi = {
  level: new URL("../public/UI/Profile/LessonsCompleted.png", import.meta.url).href,
  duration: new URL("../public/UI/Module/Time.png", import.meta.url).href,
  students: new URL("../public/UI/Module/Pupil.png", import.meta.url).href,
  rating: new URL("../public/UI/Rating/Rating.png", import.meta.url).href,
  progress: new URL("../public/UI/Profile/CompletedALesson.png", import.meta.url).href,
  lessonsCount: new URL("../public/UI/Module/AmountOfModules.png", import.meta.url).href,
  xpTrophy: new URL("../public/UI/Tasks/Tasks&Challenges Trophy.png", import.meta.url).href,
  lessonLocked: new URL("../public/UI/Sidebar/NotActive/ModulesLogoNA.png", import.meta.url).href,
  lessonDone: new URL("../public/UI/Profile/CompletedALesson.png", import.meta.url).href,
  lessonInProgress: new URL("../public/UI/Tasks/Time.png", import.meta.url).href,
  lessonPlay: new URL("../public/UI/Sidebar/Active/ModulesLogoA.png", import.meta.url).href,
} as const;

function CourseUiImg({ src, className = "h-4 w-4" }: { src: string; className?: string }) {
  return <img src={src} alt="" width={16} height={16} className={`inline-block shrink-0 object-contain ${className}`} aria-hidden />;
}

type LessonItem = {
  id: number;
  title: string;
  sortOrder?: number;
  lessonInBlock?: number;
  quizPassed?: boolean;
  duration: string;
  completed: boolean;
  status: string;
};

/** Заголовок вида «Блок 3 · Тема — урок 2» → тема для шапки карточки блока */
function blockTopicFromLessonTitle(title: string): { blockNum: number; topic: string } | null {
  const m = title.match(/^Блок (\d+) · (.+) — урок \d+$/);
  if (!m) return null;
  return { blockNum: Number(m[1]), topic: m[2] };
}

/** Прогресс блока: до 50 за урок + до 50 за тест → макс. 100 на урок (знаменатель был *50, из‑за этого выходило 200%). */
function blockProgressPercent(lessons: LessonItem[]): number {
  const max = Math.max(lessons.length * 100, 1);
  const earned = lessons.reduce((s, l) => s + (l.completed ? 50 : 0) + (l.quizPassed ? 50 : 0), 0);
  return Math.min(100, Math.round((earned / max) * 100));
}
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
    // Сортируем по порядку из БД; последний урок — финальный (раньше искали по строке «Итоговое занятие», в сиде другое название)
    const sorted = [...course.lessons].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    if (sorted.length === 0) return { lessonGroups: [], finalLesson: null };
    const final = sorted[sorted.length - 1] ?? null;
    const regularLessons = sorted.slice(0, -1);
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
          <span className="inline-flex items-center gap-1.5">
            <CourseUiImg src={moduleCourseUi.level} className="h-4 w-4" />
            Уровень: <b>{course?.level ?? "С нуля"}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CourseUiImg src={moduleCourseUi.duration} className="h-4 w-4" />
            Длительность: <b>{course?.duration ?? "-"}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CourseUiImg src={moduleCourseUi.students} className="h-4 w-4" />
            Учеников: <b>{course?.students ?? 0}</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CourseUiImg src={moduleCourseUi.rating} className="h-4 w-4" />
            Рейтинг: <b>{course?.rating != null ? Number(course.rating).toFixed(1) : "4.8"} / 5.0</b>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CourseUiImg src={moduleCourseUi.progress} className="h-4 w-4" />
            Прогресс: <b>{course?.progress ?? 0}%</b>
          </span>
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
          const blockPct = blockProgressPercent(lessons);
          const firstTitle = lessons[0]?.title ?? "";
          const parsed = blockTopicFromLessonTitle(firstTitle);
          const blockHeading = parsed ? `${parsed.blockNum}. ${parsed.topic}` : `${index + 1}. Учебный блок`;
          return (
            <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{blockHeading}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">В каждом уроке: видео → теория → тест → задание</p>
                  <p className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CourseUiImg src={moduleCourseUi.lessonsCount} className="h-3.5 w-3.5" />
                      {lessons.length} уроков
                    </span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <CourseUiImg src={moduleCourseUi.xpTrophy} className="h-3.5 w-3.5" />
                      {lessons.length * 50} XP
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-brand-500">{blockPct}%</p>
                  <div className="mt-1 h-2 w-24 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-2 rounded-full bg-slate-900 dark:bg-white"
                      style={{ width: `${blockPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {lessons.map((lesson) =>
                  lesson.status === "locked" ? (
                    <div key={lesson.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <CourseUiImg src={moduleCourseUi.lessonLocked} className="h-4 w-4 opacity-70" />
                        {lesson.title}
                      </span>
                      <span>{lesson.duration}</span>
                    </div>
                  ) : (
                    <div
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
                    >
                      <Link
                        to={`/lesson/${lesson.id}`}
                        className="flex min-w-0 flex-1 items-center gap-2 text-slate-700 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
                      >
                        {lesson.status === "completed" ? (
                          <CourseUiImg src={moduleCourseUi.lessonDone} className="h-4 w-4 shrink-0" />
                        ) : lesson.status === "in_progress" ? (
                          <CourseUiImg src={moduleCourseUi.lessonInProgress} className="h-4 w-4 shrink-0" />
                        ) : (
                          <CourseUiImg src={moduleCourseUi.lessonPlay} className="h-4 w-4 shrink-0" />
                        )}
                        <span className="min-w-0 truncate font-medium">{lesson.title}</span>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-slate-400">{lesson.duration}</span>
                        {!blockLocked && lesson.lessonInBlock ? (
                          <Link
                            to={`/quiz/${course?.id ?? id}?block=${index + 1}&lesson=${lesson.lessonInBlock}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-600"
                          >
                            <CourseUiImg src={moduleCourseUi.xpTrophy} className="h-3.5 w-3.5" />
                            Тест
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  )
                )}
                {blockLocked ? (
                  <div className="mt-2 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500">
                    Блок закрыт: сдайте все три теста предыдущего блока
                  </div>
                ) : (
                  <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">У каждого урока свой тест — кнопка «Тест» справа от урока.</p>
                )}
              </div>
            </article>
          );
        })}
        {course && finalLesson ? (
          <article className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 shadow-sm dark:border-brand-500/30 dark:bg-brand-500/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">11. {finalLesson.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Финальный блок откроется после прохождения блока 10.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {finalLesson.status === "locked" ? (
                  <>
                    <CourseUiImg src={moduleCourseUi.lessonLocked} className="h-4 w-4" />
                    Заблокировано
                  </>
                ) : finalLesson.completed ? (
                  <>
                    <CourseUiImg src={moduleCourseUi.lessonDone} className="h-4 w-4" />
                    Завершено
                  </>
                ) : (
                  <>
                    <CourseUiImg src={moduleCourseUi.lessonPlay} className="h-4 w-4" />
                    Доступно
                  </>
                )}
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
                  to={`/quiz/${course.id}?block=11&lesson=1`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <CourseUiImg src={moduleCourseUi.xpTrophy} className="h-5 w-5" />
                  Пройти итоговый тест
                </Link>
              )}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
