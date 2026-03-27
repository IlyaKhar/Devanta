import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "../components/auth/AuthShell";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";
export function LoginPage() {
    const navigate = useNavigate();
    const setToken = useAuthStore((s) => s.setToken);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", {
                email: email.trim(),
                password,
            });
            setToken(data.accessToken);
            navigate("/dashboard", { replace: true });
        }
        catch (err) {
            const msg = err && typeof err === "object" && "response" in err
                ? String(err.response?.data?.message)
                : "Не удалось войти";
            setError(msg || "Неверный email или пароль");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthShell, { title: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C!", subtitle: "\u0412\u043E\u0439\u0434\u0438, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u0435", footerNote: "\u0414\u0435\u043C\u043E-\u0432\u0435\u0440\u0441\u0438\u044F: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0441\u044F, \u0437\u0430\u0442\u0435\u043C \u0432\u043E\u0439\u0434\u0438 \u0441 \u0442\u0435\u043C\u0438 \u0436\u0435 \u0434\u0430\u043D\u043D\u044B\u043C\u0438.", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "login-email", className: "mb-1.5 block text-sm font-medium text-slate-600", children: "Email" }), _jsx("input", { id: "login-email", type: "email", autoComplete: "email", required: true, placeholder: "email@example.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "login-password", className: "mb-1.5 block text-sm font-medium text-slate-600", children: "\u041F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { id: "login-password", type: "password", autoComplete: "current-password", required: true, minLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2" })] }), error ? (_jsx("p", { className: "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700", role: "alert", children: error })) : null, _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60", children: loading ? "Входим…" : "Войти" }), _jsxs("p", { className: "text-center text-sm text-slate-600", children: ["\u041D\u0435\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430?", " ", _jsx(Link, { to: "/register", className: "font-semibold text-brand-600 underline-offset-2 hover:underline", children: "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F" })] })] }) }));
}
