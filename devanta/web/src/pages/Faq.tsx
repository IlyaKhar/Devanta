import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

type FaqItem = { q: string; a: string };
type FaqCategory = { id: string; title: string; icon: string; items: FaqItem[] };

const fallbackCategories: FaqCategory[] = [
  {
    id: "general",
    title: "Общие вопросы",
    icon: "💬",
    items: [
      {
        q: "Что такое Devanta?",
        a: "Devanta — это образовательная платформа, где ученики 7–15 лет изучают программирование через уроки, практические задачи и геймификацию.",
      },
      {
        q: "Для какого возраста подходит платформа?",
        a: "Основная аудитория — школьники 7–15 лет. Контент подается простым языком и разбит на короткие шаги.",
      },
      { q: "Нужно ли устанавливать что-то на компьютер?", a: "Нет. Большая часть обучения проходит прямо в браузере." },
      { q: "Как начать обучение?", a: "Зарегистрируй аккаунт, выбери курс и открой первый модуль." },
    ],
  },
  {
    id: "courses",
    title: "Курсы и обучение",
    icon: "🎓",
    items: [
      { q: "Какие курсы доступны?", a: "JavaScript, Python, Golang, Web, Алгоритмы, Mobile и другие направления." },
      { q: "Сколько времени занимает курс?", a: "В среднем 6–12 месяцев, зависит от темпа ученика и сложности программы." },
      { q: "Можно ли проходить несколько курсов одновременно?", a: "Да, можно изучать несколько направлений параллельно." },
      { q: "Есть ли сертификат после завершения?", a: "Планируется. Сейчас фиксируются достижения, XP и прогресс по модулям." },
    ],
  },
  {
    id: "progress",
    title: "Система прогресса",
    icon: "🏆",
    items: [
      { q: "Как работает система XP и уровней?", a: "За уроки, задачи и квизы начисляется XP. Уровень растет автоматически." },
      { q: "Что такое достижения?", a: "Это награды за ключевые этапы: первые уроки, серии задач, скорость решения." },
      { q: "Где посмотреть свой прогресс?", a: "В личном кабинете по клику на аватар справа сверху." },
      { q: "Почему прогресс может обновляться не сразу?", a: "Иногда обновление занимает несколько секунд из-за синхронизации с сервером." },
    ],
  },
  {
    id: "parents",
    title: "Родительский контроль",
    icon: "👨‍👩‍👧",
    items: [
      { q: "Есть ли режим для родителей?", a: "Да, предусмотрен раздел родительского контроля для просмотра активности ребенка." },
      { q: "Какие данные доступны родителю?", a: "Прогресс по модулям, результаты задач и динамика обучения." },
      { q: "Можно ли ограничить нагрузку?", a: "Да, можно регулировать темп, выбирая количество уроков и задач в неделю." },
    ],
  },
  {
    id: "tech",
    title: "Технические вопросы",
    icon: "🛠️",
    items: [
      { q: "Не открывается урок, что делать?", a: "Обнови страницу, проверь интернет и попробуй снова. Если не помогло — напиши в поддержку." },
      { q: "Сайт работает медленно", a: "Попробуй другой браузер, отключи лишние расширения и перезапусти вкладку." },
      { q: "Как связаться с поддержкой?", a: "Через кнопку внизу страницы FAQ или на email support@devanta.local." },
    ],
  },
];

export function FaqPage() {
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<FaqCategory[]>(fallbackCategories);

  useEffect(() => {
    let cancelled = false;
    api
      .get<FaqCategory[]>("/faq")
      .then(({ data }) => {
        if (!cancelled && data.length > 0) setCategories(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) => item.q.toLowerCase().includes(normalized) || item.a.toLowerCase().includes(normalized),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);

  function toggle(key: string) {
    setOpened((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-slate-800">
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 text-center">
          <p className="text-4xl">❓</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Часто задаваемые вопросы</h1>
          <p className="mt-2 text-slate-500">Найдите ответы на популярные вопросы и получите помощь</p>
        </div>

        <div className="mb-8">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск вопросов..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2"
          />
        </div>

        <div className="space-y-4">
          {filtered.map((cat) => (
            <section key={cat.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">
                <span className="mr-2">{cat.icon}</span>
                {cat.title}
              </h2>
              <div className="space-y-2">
                {cat.items.map((item, idx) => {
                  const key = `${cat.id}-${idx}`;
                  const isOpen = Boolean(opened[key]);
                  return (
                    <article key={key} className="rounded-xl border border-slate-100">
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                        aria-expanded={isOpen}
                      >
                        <span>{item.q}</span>
                        <span aria-hidden>{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? <p className="px-3 pb-3 text-sm leading-relaxed text-slate-600">{item.a}</p> : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl bg-brand-500 px-6 py-8 text-center text-white shadow-sm">
          <h3 className="text-2xl font-bold">Не нашли ответ на свой вопрос?</h3>
          <p className="mt-2 text-brand-50">Свяжитесь с нашей службой поддержки, мы обязательно поможем.</p>
          <a
            href="mailto:support@devanta.local"
            className="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
          >
            Связаться с поддержкой
          </a>
        </section>

        <div className="mt-8 text-center text-sm">
          <Link to="/" className="font-semibold text-brand-600 hover:text-brand-700">
            ← Вернуться на главную
          </Link>
        </div>
      </main>
    </div>
  );
}
