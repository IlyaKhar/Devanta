import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/** Вытаскивает invite token из полной ссылки или сырого JWT. */
function extractInviteToken(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const qp = s.match(/[?&]token=([^&]+)/);
  if (qp?.[1]) return decodeURIComponent(qp[1]);
  if (/^[\w-]+\.[\w-]+\.[\w-]+$/.test(s)) return s;
  try {
    const u = new URL(s);
    const q = u.searchParams.get("token");
    if (q) return q;
  } catch {
    /* не абсолютный URL */
  }
  return null;
}

export function ParentLinkPastePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    const token = extractInviteToken(text);
    if (!token) {
      setErr("Не вижу токен в ссылке. Вставь полный URL или только параметр token.");
      return;
    }
    navigate(`/parent/connect?token=${encodeURIComponent(token)}`, { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 px-4 py-10">
      <Link to="/" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
        ← На главную
      </Link>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ссылка от ребёнка</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Вставь то, что прислал ученик (целиком можно). Нужен вход как родитель — если не залогинен, отправим на логин.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="https://.../parent/connect?token=..."
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
        <button
          type="button"
          onClick={submit}
          className="mt-4 w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Открыть приглашение
        </button>
      </div>
    </div>
  );
}
