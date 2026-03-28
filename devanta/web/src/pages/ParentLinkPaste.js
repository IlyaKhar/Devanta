import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
/** Вытаскивает invite token из полной ссылки или сырого JWT. */
function extractInviteToken(input) {
    const s = input.trim();
    if (!s)
        return null;
    const qp = s.match(/[?&]token=([^&]+)/);
    if (qp?.[1])
        return decodeURIComponent(qp[1]);
    if (/^[\w-]+\.[\w-]+\.[\w-]+$/.test(s))
        return s;
    try {
        const u = new URL(s);
        const q = u.searchParams.get("token");
        if (q)
            return q;
    }
    catch {
        /* не абсолютный URL */
    }
    return null;
}
export function ParentLinkPastePage() {
    const navigate = useNavigate();
    const [text, setText] = useState("");
    const [err, setErr] = useState(null);
    function submit() {
        setErr(null);
        const token = extractInviteToken(text);
        if (!token) {
            setErr("Не вижу токен в ссылке. Вставь полный URL или только параметр token.");
            return;
        }
        navigate(`/parent/connect?token=${encodeURIComponent(token)}`, { replace: true });
    }
    return (_jsxs("div", { className: "mx-auto max-w-xl space-y-4 px-4 py-10", children: [_jsx(Link, { to: "/", className: "text-sm font-semibold text-brand-600 dark:text-brand-400", children: "\u2190 \u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E" }), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [_jsx("h1", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043E\u0442 \u0440\u0435\u0431\u0451\u043D\u043A\u0430" }), _jsx("p", { className: "mt-2 text-sm text-slate-600 dark:text-slate-400", children: "\u0412\u0441\u0442\u0430\u0432\u044C \u0442\u043E, \u0447\u0442\u043E \u043F\u0440\u0438\u0441\u043B\u0430\u043B \u0443\u0447\u0435\u043D\u0438\u043A (\u0446\u0435\u043B\u0438\u043A\u043E\u043C \u043C\u043E\u0436\u043D\u043E). \u041D\u0443\u0436\u0435\u043D \u0432\u0445\u043E\u0434 \u043A\u0430\u043A \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u2014 \u0435\u0441\u043B\u0438 \u043D\u0435 \u0437\u0430\u043B\u043E\u0433\u0438\u043D\u0435\u043D, \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u043C \u043D\u0430 \u043B\u043E\u0433\u0438\u043D." }), _jsx("textarea", { value: text, onChange: (e) => setText(e.target.value), rows: 4, placeholder: "https://.../parent/connect?token=...", className: "mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white" }), err ? _jsx("p", { className: "mt-2 text-sm text-red-600", children: err }) : null, _jsx("button", { type: "button", onClick: submit, className: "mt-4 w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435" })] })] }));
}
