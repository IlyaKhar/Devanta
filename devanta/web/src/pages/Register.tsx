import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/auth/AuthShell";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: email.trim(),
        password,
        age,
      });
      const { data } = await api.post<{ accessToken: string }>("/auth/login", {
        email: email.trim(),
        password,
      });
      setToken(data.accessToken);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? String((err as { response?: { data?: { message?: string } } }).response?.data?.message)
          : "Ошибка регистрации";
      setError(msg || "Проверь данные и попробуй снова");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Создай аккаунт"
      subtitle="Учись программированию вместе с Devanta"
      footerNote="Возраст нужен, чтобы Макс подстраивал объяснения под тебя."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-slate-600">
            Пароль
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="не меньше 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="reg-age" className="mb-1.5 block text-sm font-medium text-slate-600">
            Возраст
          </label>
          <input
            id="reg-age"
            type="number"
            min={7}
            max={15}
            required
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition focus:border-brand-500 focus:bg-white focus:ring-2"
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
          {loading ? "Создаём…" : "Зарегистрироваться"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="font-semibold text-brand-600 underline-offset-2 hover:underline">
            Войти
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
