import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post("/auth/register", {
                email: email.trim(),
                password,
                age,
            });
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
                : "Ошибка регистрации";
            setError(msg || "Проверь данные и попробуй снова");
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx(AuthShell, { title: "\u0421\u043E\u0437\u0434\u0430\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442", subtitle: "\u0423\u0447\u0438\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044E \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 Devanta", footerNote: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442 \u043D\u0443\u0436\u0435\u043D, \u0447\u0442\u043E\u0431\u044B \u041C\u0430\u043A\u0441 \u043F\u043E\u0434\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u043B \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u044F \u043F\u043E\u0434 \u0442\u0435\u0431\u044F.", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "reg-email", className: "mb-1.5 block text-sm font-medium text-slate-600", children: "Email" }), _jsx("input", { id: "reg-email", type: "email", autoComplete: "email", required: true, placeholder: "email@example.com", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reg-password", className: "mb-1.5 block text-sm font-medium text-slate-600", children: "\u041F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { id: "reg-password", type: "password", autoComplete: "new-password", required: true, minLength: 6, placeholder: "\u043D\u0435 \u043C\u0435\u043D\u044C\u0448\u0435 6 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "reg-age", className: "mb-1.5 block text-sm font-medium text-slate-600", children: "\u0412\u043E\u0437\u0440\u0430\u0441\u0442" }), _jsx("input", { id: "reg-age", type: "number", min: 7, max: 15, required: true, value: age, onChange: (e) => setAge(Number(e.target.value)), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none ring-brand-500 transition focus:border-brand-500 focus:bg-white focus:ring-2" })] }), error ? (_jsx("p", { className: "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700", role: "alert", children: error })) : null, _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-xl bg-brand-500 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60", children: loading ? "Создаём…" : "Зарегистрироваться" }), _jsxs("p", { className: "text-center text-sm text-slate-600", children: ["\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442?", " ", _jsx(Link, { to: "/login", className: "font-semibold text-brand-600 underline-offset-2 hover:underline", children: "\u0412\u043E\u0439\u0442\u0438" })] })] }) }));
}
