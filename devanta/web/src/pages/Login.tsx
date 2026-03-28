import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthShell } from "../components/auth/AuthShell";
import { api, getAxiosErrorMessage } from "../services/api";
import { useAuthStore } from "../store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{ accessToken: string }>("/auth/login", {
        email: email.trim(),
        password,
      });
      setToken(data.accessToken);
      const next = searchParams.get("next");
      const role = useAuthStore.getState().role;
      const staff = role === "admin" || role === "moderator";
      const dest =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : role === "parent"
            ? "/parent"
            : staff
              ? "/admin"
              : "/dashboard";
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, "Не удалось войти. Проверь email и пароль."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Добро пожаловать!"
      subtitle="Войди, чтобы продолжить обучение"
      footerNote="Демо-версия: сначала зарегистрируйся, затем войди с теми же данными."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-600">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Входим…" : "Войти"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link
            to={searchParams.toString() ? `/register?${searchParams.toString()}` : "/register"}
            className="font-semibold text-brand-600 underline-offset-2 hover:underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
