import { Link } from "react-router-dom";

const languages = [
  {
    name: "Python",
    difficulty: "Лёгкий",
    popularity: "98%",
    desc: "Простой синтаксис — идеально для первых шагов в коде.",
    uses: ["Веб", "ИИ", "Автоматизация"],
    ides: ["VS Code", "PyCharm"],
  },
  {
    name: "JavaScript",
    difficulty: "Средний",
    popularity: "95%",
    desc: "Язык веба: интерактивные страницы и игры в браузере.",
    uses: ["Фронтенд", "Игры", "Серверы"],
    ides: ["VS Code", "WebStorm"],
  },
  {
    name: "Java",
    difficulty: "Средний",
    popularity: "92%",
    desc: "Надёжный язык для приложений и больших проектов.",
    uses: ["Android", "Серверы", "Корпоративные системы"],
    ides: ["IntelliJ IDEA", "Eclipse"],
  },
  {
    name: "C++",
    difficulty: "Сложный",
    popularity: "88%",
    desc: "Скорость и контроль — основа игр и системного ПО.",
    uses: ["Игры", "Графика", "Встраиваемые системы"],
    ides: ["Visual Studio", "CLion"],
  },
  {
    name: "C#",
    difficulty: "Средний",
    popularity: "90%",
    desc: "Удобный язык от Microsoft для игр и приложений.",
    uses: ["Unity", "Windows", "Веб"],
    ides: ["Visual Studio", "Rider"],
  },
  {
    name: "Swift",
    difficulty: "Средний",
    popularity: "85%",
    desc: "Современный язык для приложений под Apple.",
    uses: ["iOS", "macOS", "Мобильные приложения"],
    ides: ["Xcode", "VS Code"],
  },
];

const testimonials = [
  {
    name: "Ева",
    text: "Раньше думала, что программирование — не для меня. Здесь всё по шагам, с заданиями как в игре — уже прошла первый модуль!",
  },
  {
    name: "Дмитрий",
    text: "Удобно учиться после школы: короткие уроки и сразу практика. Лидерборд мотивирует не бросать.",
  },
  {
    name: "Анна",
    text: "Макс объясняет простыми словами, если застряла на задаче. Родителям нравится прогресс в кабинете.",
  },
  {
    name: "Максим",
    text: "Хотел сделать свою игру — научился основам логики и циклов. Продолжаю к следующему модулю.",
  },
];

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold text-white shadow-sm ${className}`}
      aria-hidden
    >
      &lt;/&gt;
    </div>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-800">
      {/* Шапка */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <LogoMark />
            <span className="text-lg font-semibold text-brand-600">Devanta</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:inline"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
            >
              Начать обучение
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="border-b border-slate-100 bg-gradient-to-b from-white to-brand-50/40 px-4 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Научись программировать{" "}
              <span className="text-brand-600">играючи</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
              Интерактивные уроки, мини-игры и практика прямо в браузере. Развивай логику и цифровую грамотность вместе с
              наставником Максом и сообществом учеников.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:bg-brand-600 sm:w-auto"
              >
                Начать бесплатно
              </Link>
              <Link
                to="/login"
                className="text-sm font-semibold text-brand-600 underline-offset-2 hover:underline"
              >
                Уже есть аккаунт — войти
              </Link>
            </div>
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-brand-600">50 000+</p>
                <p className="text-sm text-slate-600">учеников</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-brand-600">100+</p>
                <p className="text-sm text-slate-600">курсов и модулей</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-2xl font-bold text-brand-600">1000+</p>
                <p className="text-sm text-slate-600">задач и квизов</p>
              </div>
            </div>
          </div>
        </section>

        {/* Языки */}
        <section className="px-4 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-brand-600">
                  <span className="text-xl" aria-hidden>
                    &lt;/&gt;
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-wide">Направления</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Популярные языки программирования</h2>
                <p className="mt-2 max-w-2xl text-slate-600">Выбери старт — от простого Python до Swift для приложений.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang) => (
                <article
                  key={lang.name}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{lang.name}</h3>
                    <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                      {lang.difficulty}
                    </span>
                  </div>
                  <p className="mb-2 text-xs font-medium text-brand-600">{lang.popularity} популярность</p>
                  <p className="mb-4 flex-1 text-sm text-slate-600">{lang.desc}</p>
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-medium text-slate-500">Где используется</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lang.uses.map((t) => (
                        <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-slate-500">Популярные IDE</p>
                    <div className="flex flex-wrap gap-1.5">
                      {lang.ides.map((t) => (
                        <span key={t} className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/register"
                className="inline-flex rounded-2xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-brand-600"
              >
                Начать изучение сейчас
              </Link>
            </div>
          </div>
        </section>

        {/* Отзывы */}
        <section className="border-y border-slate-100 bg-white px-4 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
              IT — это про возможности, а не про ограничения
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-center text-slate-600">
              Реальные истории ребят, которые начали с основ и не бросили.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-slate-100 bg-[#FAFAF8] p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    {t.name[0]}
                  </div>
                  <figcaption className="mb-2 font-semibold text-slate-900">{t.name}</figcaption>
                  <blockquote className="text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</blockquote>
                </figure>
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link to="/reviews" className="text-sm font-semibold text-brand-600 underline-offset-2 hover:underline">
                Все отзывы
              </Link>
            </div>
          </div>
        </section>

        {/* Финальный CTA */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-4xl rounded-3xl bg-brand-500 px-6 py-12 text-center shadow-lg sm:px-10 sm:py-14">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Готов начать своё путешествие в мир кода?</h2>
            <p className="mx-auto mt-3 max-w-xl text-brand-50">
              Присоединяйся к тысячам учеников: уроки, задачи и Макс помогут не сорваться на полпути.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex rounded-2xl bg-white px-8 py-3.5 text-base font-semibold text-brand-600 shadow-md transition hover:bg-brand-50"
            >
              Начать обучение сейчас
            </Link>
          </div>
        </section>
      </main>

      {/* Футер */}
      <footer className="border-t border-slate-200 bg-slate-100/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <LogoMark className="!h-8 !w-8" />
              <span className="font-semibold text-brand-600">Devanta</span>
            </div>
            <p className="text-sm text-slate-600">
              Платформа для школьников 7–15 лет: основы программирования, цифровая грамотность и геймификация в одном
              месте.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Поддержка</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/faq" className="hover:text-brand-600">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@devanta.local" className="hover:text-brand-600">
                  Связаться с нами
                </a>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-600">
                  Сообщить о проблеме
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Devanta. Все права защищены.
        </div>
      </footer>
    </div>
  );
}
