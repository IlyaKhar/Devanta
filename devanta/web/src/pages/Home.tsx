import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="mx-auto max-w-md space-y-4 p-4">
      <h1 className="text-2xl font-bold text-brand-600">Devanta</h1>
      <p className="text-slate-700">Учись через игру вместе с Максом.</p>
      <div className="grid gap-3">
        <Link className="rounded-xl bg-brand-500 p-4 text-center font-semibold text-white" to="/dashboard">Продолжить обучение</Link>
        <Link className="rounded-xl border p-4 text-center" to="/reviews">Отзывы</Link>
        <Link className="rounded-xl border p-4 text-center" to="/leaderboard">Лидерборд</Link>
      </div>
    </main>
  );
}
