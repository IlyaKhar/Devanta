import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api";

type ConnectResponse = {
  valid: boolean;
  studentUserId: number;
  studentName: string;
  connected: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function ParentConnectPage() {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);
  const [data, setData] = useState<ConnectResponse | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotice("В ссылке нет токена подключения.");
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setNotice(null);
    api
      .get<ConnectResponse>(`/parent/connect?token=${encodeURIComponent(token)}`)
      .then(({ data }) => {
        if (!cancelled) setData(data);
      })
      .catch(() => {
        if (!cancelled) setNotice("Ссылка недействительна или истекла.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function submit() {
    setNotice(null);
    if (!token) {
      setNotice("В ссылке нет токена подключения.");
      return;
    }
    if (!isValidEmail(parentEmail)) {
      setNotice("Введите корректный email родителя.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.get<ConnectResponse>(
        `/parent/connect?token=${encodeURIComponent(token)}&parent=${encodeURIComponent(parentEmail.trim())}`
      );
      setData(data);
      setNotice("Готово! Родитель подключен.");
      setParentEmail("");
    } catch {
      setNotice("Не удалось подтвердить подключение. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            ← Devanta
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">Родительский контроль</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white">🛡</div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Подключение родителя</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Подтвердите подключение, чтобы видеть прогресс ученика.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              Проверяем ссылку...
            </div>
          ) : null}

          {data ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              Ученик: <b>{data.studentName}</b>
            </div>
          ) : null}

          {notice ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {notice}
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Email родителя</label>
            <input
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="parent@example.com"
              inputMode="email"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-4 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              disabled={!token || !data || isSubmitting}
              onClick={submit}
              className="mt-2 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Подключаю..." : "Подтвердить подключение"}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Нажимая «Подтвердить», вы соглашаетесь получать данные о прогрессе ученика в рамках родительского контроля.
          </p>
        </div>
      </div>
    </div>
  );
}

