import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

type FaqCategoryResponse = {
  id: string;
  title: string;
  icon: string;
  items: Array<{ id: number; q: string; a: string }>;
};

type FaqRow = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

const categories = [
  { id: "general", title: "Общие вопросы" },
  { id: "courses", title: "Курсы и обучение" },
  { id: "progress", title: "Система прогресса" },
  { id: "parents", title: "Родительский контроль" },
  { id: "tech", title: "Технические вопросы" },
];

export function AdminFaqPage() {
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [category, setCategory] = useState("general");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function loadRows() {
    setIsLoading(true);
    setNotice(null);
    try {
      const { data } = await api.get<FaqCategoryResponse[]>("/faq");
      const flat = data.flatMap((cat) =>
        cat.items.map((item) => ({
          id: item.id,
          category: cat.id,
          question: item.q,
          answer: item.a,
        })),
      );
      setRows(flat);
    } catch {
      setNotice("Не удалось загрузить FAQ. Проверь права admin.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRows();
  }, []);

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.category === b.category ? a.id - b.id : a.category.localeCompare(b.category))),
    [rows],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setIsSaving(true);
    setNotice(null);
    try {
      if (editingId) {
        await api.put(`/admin/faq/${editingId}`, {
          category,
          question: question.trim(),
          answer: answer.trim(),
          sortOrder: 0,
        });
        setNotice("FAQ обновлен.");
      } else {
        await api.post("/admin/faq", {
          category,
          question: question.trim(),
          answer: answer.trim(),
          sortOrder: 0,
        });
        setNotice("FAQ создан.");
      }
      setEditingId(null);
      setQuestion("");
      setAnswer("");
      await loadRows();
    } catch {
      setNotice("Ошибка сохранения. Нужна роль admin.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setNotice(null);
    try {
      await api.delete(`/admin/faq/${id}`);
      setRows((prev) => prev.filter((row) => row.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setQuestion("");
        setAnswer("");
      }
      setNotice("FAQ удален.");
    } catch {
      setNotice("Ошибка удаления. Нужна роль admin.");
    }
  }

  function handleEdit(row: FaqRow) {
    setEditingId(row.id);
    setCategory(row.category);
    setQuestion(row.question);
    setAnswer(row.answer);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Админка FAQ</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Создание и редактирование вопросов для страницы FAQ.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Категория</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Вопрос</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Введите вопрос"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Ответ</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
              placeholder="Введите ответ"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {editingId ? "Сохранить изменения" : "Добавить FAQ"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setQuestion("");
                  setAnswer("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Отмена
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {notice ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {notice}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Список FAQ</h2>
        {isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Загружаем...</p> : null}
        <div className="space-y-2">
          {sortedRows.map((row) => (
            <article key={row.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {categories.find((c) => c.id === row.category)?.title ?? row.category}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">{row.question}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{row.answer}</p>
            </article>
          ))}
          {!isLoading && sortedRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">FAQ пока пуст.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
