import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";
export function ParentConnectPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const token = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);
    const accessToken = useAuthStore((s) => s.accessToken);
    const role = useAuthStore((s) => s.role);
    const [data, setData] = useState(null);
    const [notice, setNotice] = useState(null);
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
            .get(`/parent/connect?token=${encodeURIComponent(token)}`)
            .then(({ data: d }) => {
            if (!cancelled)
                setData(d);
        })
            .catch(() => {
            if (!cancelled)
                setNotice("Ссылка недействительна или истекла.");
        })
            .finally(() => {
            if (!cancelled)
                setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [token]);
    // Залогинен родитель — сразу привязываем и открываем прогресс.
    useEffect(() => {
        if (!token || !accessToken || role !== "parent" || !data?.valid || autoTried.current)
            return;
        autoTried.current = true;
        setIsAccepting(true);
        setNotice(null);
        api
            .post("/parent/accept-invite", { inviteToken: token })
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
        if (!token)
            return;
        setIsAccepting(true);
        setNotice(null);
        try {
            const { data: d } = await api.post("/parent/accept-invite", { inviteToken: token });
            navigate(`/parent/student/${d.studentUserId}`, { replace: true });
        }
        catch {
            setNotice("Ошибка привязки. Войди как родитель и попробуй снова.");
        }
        finally {
            setIsAccepting(false);
        }
    }
    async function goToParentLogin() {
        setIsSwitchingAccount(true);
        try {
            if (mustLogoutBeforeAuth) {
                try {
                    await api.post("/auth/logout");
                }
                catch {
                    /* нет cookie — ок */
                }
                logout();
            }
            navigate(`/login?next=${encodeURIComponent(nextUrl)}`, { replace: true });
        }
        finally {
            setIsSwitchingAccount(false);
        }
    }
    async function goToParentRegister() {
        setIsSwitchingAccount(true);
        try {
            if (mustLogoutBeforeAuth) {
                try {
                    await api.post("/auth/logout");
                }
                catch {
                    /* ок */
                }
                logout();
            }
            navigate(`/register?as=parent&next=${encodeURIComponent(nextUrl)}`, { replace: true });
        }
        finally {
            setIsSwitchingAccount(false);
        }
    }
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950", children: _jsxs("div", { className: "w-full max-w-xl space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400", children: "\u2190 Devanta" }), _jsx("span", { className: "text-xs text-slate-500 dark:text-slate-400", children: "\u041F\u0440\u0438\u0433\u043B\u0430\u0448\u0435\u043D\u0438\u0435 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F" })] }), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-2xl text-white", children: "\uD83D\uDEE1" }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-3xl font-black text-slate-900 dark:text-white", children: "\u0421\u0432\u044F\u0437\u044C \u0441 \u0440\u0435\u0431\u0451\u043D\u043A\u043E\u043C" }), _jsx("p", { className: "mt-1 text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u0440\u0438\u0432\u044F\u0437\u043A\u0430 \u0438\u0434\u0451\u0442 \u043A \u0442\u0432\u043E\u0435\u043C\u0443 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0443 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F \u2014 \u043E\u0434\u0438\u043D \u0440\u0430\u0437 \u0437\u0430\u043B\u043E\u0433\u0438\u043D\u0438\u043B\u0441\u044F, \u0438 \u0441\u0441\u044B\u043B\u043A\u0430 \u0441\u0440\u0430\u0437\u0443 \u043E\u0442\u043A\u0440\u043E\u0435\u0442 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441." })] })] }), isLoading ? (_jsx("div", { className: "mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/40", children: "\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u0441\u044B\u043B\u043A\u0443\u2026" })) : null, role === "parent" && isAccepting ? (_jsx("div", { className: "mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200", children: "\u041F\u0440\u0438\u0432\u044F\u0437\u044B\u0432\u0430\u0435\u043C \u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u043C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441\u2026" })) : null, data?.valid ? (_jsxs("div", { className: "mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200", children: ["\u0423\u0447\u0435\u043D\u0438\u043A: ", _jsx("b", { children: data.studentName })] })) : null, notice ? (_jsx("div", { className: "mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300", children: notice })) : null, data?.valid && mustLogoutBeforeAuth ? (_jsx("p", { className: "mt-4 text-sm text-amber-700 dark:text-amber-400", children: "\u0421\u0435\u0439\u0447\u0430\u0441 \u043E\u0442\u043A\u0440\u044B\u0442 \u0434\u0440\u0443\u0433\u043E\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 (\u043D\u0435 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439). \u041A\u043D\u043E\u043F\u043A\u0438 \u043D\u0438\u0436\u0435 \u0441\u0430\u043C\u0438 \u0432\u044B\u0439\u0434\u0443\u0442 \u0438\u0437 \u043D\u0435\u0433\u043E \u0438 \u043E\u0442\u043A\u0440\u043E\u044E\u0442 \u0432\u0445\u043E\u0434 \u0438\u043B\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F \u2014 \u0440\u0443\u043A\u0430\u043C\u0438 \u0432\u044B\u0445\u043E\u0434\u0438\u0442\u044C \u043D\u0435 \u043D\u0443\u0436\u043D\u043E." })) : null, data?.valid && (!accessToken || role !== "parent") ? (_jsxs("div", { className: "mt-5 flex flex-col gap-2 sm:flex-row", children: [_jsx("button", { type: "button", disabled: isSwitchingAccount, onClick: () => void goToParentLogin(), className: "flex flex-1 items-center justify-center rounded-2xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60", children: isSwitchingAccount ? "Выходим…" : "Войти как родитель" }), _jsx("button", { type: "button", disabled: isSwitchingAccount, onClick: () => void goToParentRegister(), className: "flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold disabled:opacity-60 dark:border-slate-700", children: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F" })] })) : null, data?.valid && accessToken && role === "parent" && !isAccepting ? (_jsx("button", { type: "button", onClick: () => void acceptManually(), className: "mt-5 w-full rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u0443" })) : null, _jsx("p", { className: "mt-4 text-xs text-slate-500 dark:text-slate-400", children: "\u041D\u0435\u0442 \u0441\u0441\u044B\u043B\u043A\u0438 \u0446\u0435\u043B\u0438\u043A\u043E\u043C? \u041D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u00AB\u0412\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443\u00BB \u043C\u043E\u0436\u043D\u043E \u0432\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0442\u0435\u043A\u0441\u0442 \u043E\u0442 \u0440\u0435\u0431\u0451\u043D\u043A\u0430." })] })] }) }));
}
