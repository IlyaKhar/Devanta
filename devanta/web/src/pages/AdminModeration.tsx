import { useCallback, useEffect, useState } from "react";
import { api, getAxiosErrorMessage } from "../services/api";

type ModReview = { id: number; status?: string; text?: string; rating?: number };

export function AdminModerationPage() {
  const [items, setItems] = useState<ModReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    try {
      const { data } = await api.get<ModReview[]>("/moderation/reviews");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Нет доступа или ошибка API"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function publish(id: number) {
    try {
      await api.post(`/moderation/reviews/${id}/publish`);
      setNotice(`Отзыв ${id} — опубликован (заглушка API)`);
      await load();
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Ошибка"));
    }
  }

  async function reject(id: number) {
    try {
      await api.post(`/moderation/reviews/${id}/reject`);
      setNotice(`Отзыв ${id} — отклонён (заглушка API)`);
      await load();
    } catch (e) {
      setNotice(getAxiosErrorMessage(e, "Ошибка"));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white">Модерация отзывов</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Когда бэкенд подключит реальные отзывы из БД, здесь появится очередь. Сейчас API отдаёт демо-данные.
      </p>
      {notice ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">{notice}</div>
      ) : null}
      {loading ? <p className="text-sm text-slate-500">Загрузка…</p> : null}
      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-400">#{r.id} · {r.status ?? "—"}</p>
            {r.text ? <p className="mt-1 text-slate-800 dark:text-slate-100">{r.text}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void publish(r.id)}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Опубликовать
              </button>
              <button
                type="button"
                onClick={() => void reject(r.id)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-800 dark:text-red-400"
              >
                Отклонить
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Очередь пуста.</p> : null}
    </div>
  );
}
