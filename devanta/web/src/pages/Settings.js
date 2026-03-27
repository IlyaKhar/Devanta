import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";
function tabClass(active) {
    return `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${active
        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`;
}
export function SettingsPage() {
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const [tab, setTab] = useState("profile");
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bio, setBio] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [notice, setNotice] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [usernameError, setUsernameError] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const avatarInputRef = useRef(null);
    const bioCount = useMemo(() => bio.length, [bio]);
    useEffect(() => {
        let cancelled = false;
        api
            .get("/settings/profile")
            .then(({ data }) => {
            if (cancelled)
                return;
            setFullName(data.fullName ?? "");
            setUsername(data.username ?? "");
            setEmail(data.email ?? "");
            setBio(data.bio ?? "");
            setAvatarUrl(data.avatarUrl ?? "");
            setEmailNotifications(Boolean(data.emailNotifications));
            setPushNotifications(Boolean(data.pushNotifications));
        })
            .catch(() => {
            if (!cancelled)
                setNotice("Не удалось загрузить настройки.");
        });
        return () => {
            cancelled = true;
        };
    }, []);
    async function saveProfile() {
        setNotice(null);
        const trimmedEmail = email.trim();
        const trimmedUsername = username.trim();
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
        const isUsernameValid = /^[a-zA-Z0-9_]{3,24}$/.test(trimmedUsername);
        setEmailError(isEmailValid ? null : "Некорректный email.");
        setUsernameError(isUsernameValid ? null : "Username: 3-24 символа, только латиница/цифры/_");
        if (!isEmailValid || !isUsernameValid) {
            setNotice("Исправь ошибки в форме профиля.");
            return;
        }
        try {
            await api.put("/settings/profile", { fullName, username: trimmedUsername, email: trimmedEmail, bio, avatarUrl });
            setNotice("Профиль сохранен.");
        }
        catch {
            setNotice("Ошибка сохранения профиля.");
        }
    }
    async function saveNotifications() {
        setNotice(null);
        try {
            await api.put("/settings/notifications", { emailNotifications, pushNotifications });
            setNotice("Настройки уведомлений сохранены.");
        }
        catch {
            setNotice("Ошибка сохранения уведомлений.");
        }
    }
    async function changePassword() {
        setNotice(null);
        if (newPassword !== confirmPassword) {
            setNotice("Новый пароль и подтверждение не совпадают.");
            return;
        }
        try {
            await api.post("/settings/password", { currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setNotice("Пароль успешно изменен.");
        }
        catch {
            setNotice("Не удалось изменить пароль.");
        }
    }
    async function confirmDeleteAccount() {
        setNotice(null);
        try {
            await api.delete("/settings/account");
            await api.post("/auth/logout");
            logout();
            navigate("/register", { replace: true });
        }
        catch {
            setNotice("Не удалось удалить аккаунт.");
        }
        finally {
            setIsDeleteModalOpen(false);
        }
    }
    async function uploadAvatar(file) {
        setNotice(null);
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const { data } = await api.post("/settings/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAvatarUrl(data.avatarUrl ?? "");
            setNotice("Аватар обновлен. Нажми сохранить профиль.");
        }
        catch {
            setNotice("Не удалось загрузить аватар. Допустимо: jpg/jpeg/png/gif/webp до 2MB.");
        }
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl space-y-5", children: [_jsxs("section", { children: [_jsx("h1", { className: "text-5xl font-black text-slate-900 dark:text-white", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("p", { className: "mt-2 text-slate-500 dark:text-slate-400", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u0441\u0432\u043E\u0438\u043C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u043E\u043C \u0438 \u043F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F\u043C\u0438" })] }), notice ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300", children: notice })) : null, _jsxs("section", { className: "flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800", children: [_jsx("button", { type: "button", onClick: () => setTab("profile"), className: tabClass(tab === "profile"), children: "\uD83D\uDC64 \u041F\u0440\u043E\u0444\u0438\u043B\u044C" }), _jsx("button", { type: "button", onClick: () => setTab("notifications"), className: tabClass(tab === "notifications"), children: "\uD83D\uDD14 \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("button", { type: "button", onClick: () => setTab("security"), className: tabClass(tab === "security"), children: "\uD83D\uDD12 \u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C" })] }), tab === "profile" ? (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white", children: "\uD83D\uDC64" }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u041B\u0438\u0447\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "\u041E\u0431\u043D\u043E\u0432\u0438 \u0441\u0432\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u0410\u0432\u0430\u0442\u0430\u0440" }), _jsxs("div", { className: "flex items-center gap-3", children: [avatarUrl ? (_jsx("img", { src: avatarUrl, alt: "\u0410\u0432\u0430\u0442\u0430\u0440 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", className: "h-20 w-20 rounded-full object-cover" })) : (_jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-4xl text-white", children: "\uD83E\uDDD1\u200D\uD83D\uDCBB" })), _jsxs("div", { children: [_jsx("input", { ref: avatarInputRef, type: "file", accept: "image/png,image/jpeg,image/jpg,image/gif,image/webp", className: "hidden", onChange: (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file)
                                                                uploadAvatar(file);
                                                        } }), _jsx("button", { type: "button", onClick: () => avatarInputRef.current?.click(), className: "rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E" }), _jsx("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400", children: "JPG, PNG, GIF, WEBP. \u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 2MB." })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u041F\u043E\u043B\u043D\u043E\u0435 \u0438\u043C\u044F" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }), _jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" }), usernameError ? _jsx("p", { className: "mt-1 text-xs text-red-500", children: usernameError }) : null] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "Email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" }), emailError ? _jsx("p", { className: "mt-1 text-xs text-red-500", children: emailError }) : null] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0430\u0432\u0430\u0442\u0430\u0440" }), _jsx("input", { value: avatarUrl, onChange: (e) => setAvatarUrl(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: "https://..." })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u041E \u0441\u0435\u0431\u0435" }), _jsx("textarea", { value: bio, onChange: (e) => setBio(e.target.value.slice(0, 200)), rows: 3, className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" }), _jsxs("p", { className: "mt-1 text-xs text-slate-500 dark:text-slate-400", children: [bioCount, "/200 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"] })] }), _jsx("button", { type: "button", onClick: saveProfile, className: "mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "\uD83D\uDCBE \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" })] })] })) : null, tab === "notifications" ? (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-2xl text-white", children: "\uD83D\uDD14" }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439, \u043A\u0430\u043A \u0438 \u043A\u043E\u0433\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: "Email \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u043E\u043B\u0443\u0447\u0430\u0439 \u0432\u0430\u0436\u043D\u044B\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0430 \u043F\u043E\u0447\u0442\u0443" })] }), _jsx("button", { type: "button", onClick: () => setEmailNotifications((v) => !v), className: `h-7 w-12 rounded-full transition ${emailNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}` })] }), _jsxs("div", { className: "flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: "Push \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400", children: "\u041F\u043E\u043B\u0443\u0447\u0430\u0439 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435" })] }), _jsx("button", { type: "button", onClick: () => setPushNotifications((v) => !v), className: `h-7 w-12 rounded-full transition ${pushNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}` })] })] }), _jsx("button", { type: "button", onClick: saveNotifications, className: "mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "\uD83D\uDCBE \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" })] })) : null, tab === "security" ? (_jsxs("section", { className: "space-y-4", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-2xl text-white", children: "\uD83D\uDD12" }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u043F\u0430\u0440\u043E\u043B\u0435\u043C \u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C\u044E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: newPassword, onChange: (e) => setNewPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800", placeholder: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] })] }), _jsx("button", { type: "button", onClick: changePassword, className: "mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: "\uD83D\uDD10 \u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsx("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-slate-900 dark:text-white", children: "\u0414\u0432\u0443\u0445\u0444\u0430\u043A\u0442\u043E\u0440\u043D\u0430\u044F \u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F" }), _jsx("p", { className: "text-slate-500 dark:text-slate-400", children: "\u0414\u043E\u0431\u0430\u0432\u044C \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0437\u0430\u0449\u0438\u0442\u044B" })] }), _jsx("button", { type: "button", className: "rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u2192" })] }) }), _jsxs("article", { className: "rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm dark:border-red-500/30 dark:bg-red-500/5", children: [_jsx("h3", { className: "text-3xl font-black text-red-600 dark:text-red-400", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442" }), _jsx("p", { className: "mt-1 text-sm text-red-500 dark:text-red-300", children: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u0432\u0441\u0435 \u0442\u0432\u043E\u0438 \u0434\u0430\u043D\u043D\u044B\u0435, \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0431\u0443\u0434\u0443\u0442 \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u044B." }), _jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(true), className: "mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700", children: "\uD83D\uDDD1 \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043C\u043E\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442" })] })] })) : null, isDeleteModalOpen ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900", children: [_jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430?" }), _jsx("p", { className: "mt-2 text-sm text-slate-500 dark:text-slate-400", children: "\u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E. \u0412\u0435\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0435\u043D." }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(false), className: "flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "button", onClick: confirmDeleteAccount, className: "flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }) })) : null] }));
}
