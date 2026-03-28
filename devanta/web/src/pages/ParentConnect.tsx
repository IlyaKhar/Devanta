import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";

type PreviewResponse = {
  valid: boolean;
  studentUserId: number;
  studentName: string;
};

export function ParentConnectPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

  const [data, setData] = useState<PreviewResponse | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const autoTried = useRef(false);
  const logout = useAuthStore((s) => s.logout);

  const nextUrl = `/parent/connect?token=${encodeURIComponent(token)}`;
  /** Залогинен не родитель — перед логином родителя обязательно сбросить сессию, иначе GuestOnlyRoute уводит на next и форма не откроется. */
  const mustLogoutBeforeAuth = Boolean(accessToken && role !== "parent");

  useEffect(() => {
    if (!token) {
      setNotice("В ссылке нет токена приглашения.");
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setNotice(null);
    api
      .get<PreviewResponse>(`/parent/connect?token=${encodeURIComponent(token)}`)
      .then(({ data: d }) => {
        if (!cancelled) setData(d);
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

  // Залогинен родитель — сразу привязываем и открываем прогресс.
  useEffect(() => {
    if (!token || !accessToken || role !== "parent" || !data?.valid || autoTried.current) return;
    autoTried.current = true;
    setIsAccepting(true);
    setNotice(null);
    api
      .post<{ studentUserId: number }>("/parent/accept-invite", { inviteToken: token })
      .then(({ data: d }) => {
        navigate(`/parent/student/${d.studentUserId}`, { replace: true });
      })
      .catch(() => {
        autoTried.current = false;
        setNotice("Не удалось привязаться. Попробуй ещё раз по кнопке ниже.");
      })
      .finally(() => setIsAccepting(false));
  }, [token, accessToken, role, data?.valid, navigate]);

  async function acceptManually() {
    if (!token) return;
    setIsAccepting(true);
    setNotice(null);
    try {
      const { data: d } = await api.post<{ studentUserId: number }>("/parent/accept-invite", { inviteToken: token });
      navigate(`/parent/student/${d.studentUserId}`, { replace: true });
    } catch {
      setNotice("Ошибка привязки. Войди как родитель и попробуй снова.");
    } finally {
      setIsAccepting(false);
    }
  }

  async function goToParentLogin() {
    setIsSwitchingAccount(true);
    try {
      if (mustLogoutBeforeAuth) {
        try {
          await api.post("/auth/logout");
        } catch {
          /* нет cookie — ок */
        }
        logout();
      }
      navigate(`/login?next=${encodeURIComponent(nextUrl)}`, { replace: true });
    } finally {
      setIsSwitchingAccount(false);
    }
  }

  async function goToParentRegister() {
    setIsSwitchingAccount(true);
    try {
      if (mustLogoutBeforeAuth) {
        try {
          await api.post("/auth/logout");
        } catch {
          /* ок */
        }
        logout();
      }
      navigate(`/register?as=parent&next=${encodeURIComponent(nextUrl)}`, { replace: true });
    } finally {
      setIsSwitchingAccount(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-xl space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
            ← Devanta
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">Приглашение родителя</span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white">🛡</div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">Связь с ребёнком</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Привязка идёт к твоему аккаунту родителя — один раз залогинился, и ссылка сразу откроет прогресс.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/40">
              Проверяем ссылку…
            </div>
          ) : null}

          {role === "parent" && isAccepting ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              Привязываем и открываем прогресс…
            </div>
          ) : null}

          {data?.valid ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
              Ученик: <b>{data.studentName}</b>
            </div>
          ) : null}

          {notice ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {notice}
            </div>
          ) : null}

          {data?.valid && mustLogoutBeforeAuth ? (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
              Сейчас открыт другой аккаунт (не родительский). Кнопки ниже сами выйдут из него и откроют вход или регистрацию родителя — руками выходить не нужно.
            </p>
          ) : null}

          {data?.valid && (!accessToken || role !== "parent") ? (
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={isSwitchingAccount}
                onClick={() => void goToParentLogin()}
                className="flex flex-1 items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {isSwitchingAccount ? "Выходим…" : "Войти как родитель"}
              </button>
              <button
                type="button"
                disabled={isSwitchingAccount}
                onClick={() => void goToParentRegister()}
                className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold disabled:opacity-60 dark:border-slate-700"
              >
                Регистрация родителя
              </button>
            </div>
          ) : null}

          {data?.valid && accessToken && role === "parent" && !isAccepting ? (
            <button
              type="button"
              onClick={() => void acceptManually()}
              className="mt-5 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Подтвердить привязку
            </button>
          ) : null}

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Нет ссылки целиком? На странице «Вставить ссылку» можно вставить текст от ребёнка.
          </p>
        </div>
      </div>
    </div>
  );
}
