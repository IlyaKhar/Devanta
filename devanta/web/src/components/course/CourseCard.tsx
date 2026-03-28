import { Link } from "react-router-dom";
import type { Course } from "../../data/courseCatalog";
import { moduleMetaUi } from "../../data/courseCatalog";

type Props = { course: Course; moduleId: number };

/** Карточка курса: как на /modules, без стикера на обложке. */
export function CourseCard({ course, moduleId }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img src={course.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        {course.isPopular ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-brand-600 dark:bg-slate-900/90 dark:text-brand-400">
            Популярно
          </span>
        ) : null}
        {course.discount ? (
          <span className="absolute right-3 top-12 rounded-full bg-blue-500/90 px-2 py-1 text-xs font-semibold text-white">
            {course.discount}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <h2 className="text-[1.4rem] font-bold leading-tight text-slate-900 dark:text-white">{course.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{course.description}</p>

        <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <img
              src={moduleMetaUi.modules}
              alt=""
              className="h-4 w-4 shrink-0 object-contain"
              width={16}
              height={16}
            />
            <span>
              {course.modules} модулей
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <img src={moduleMetaUi.time} alt="" className="h-4 w-4 shrink-0 object-contain" width={16} height={16} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <img
              src={moduleMetaUi.students}
              alt=""
              className="h-4 w-4 shrink-0 object-contain"
              width={16}
              height={16}
            />
            <span>{course.students} учеников</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{course.level}</span>
          <Link
            to={`/module/${moduleId}`}
            className="text-sm font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400"
          >
            {course.actionLabel} →
          </Link>
        </div>
      </div>
    </article>
  );
}
