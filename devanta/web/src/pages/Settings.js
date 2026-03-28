import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mediaUrl } from "../lib/mediaUrl";
import { api, getAxiosErrorMessage } from "../services/api";
import { useAuthStore } from "../store/auth";
// Иконки страницы «Настройки» (src/public/UI/Settings)
const settingsUi = {
    tabProfile: new URL("../public/UI/Settings/SettingsProfile.png", import.meta.url).href,
    tabNotif: new URL("../public/UI/Settings/SettingsNotif.png", import.meta.url).href,
    tabSecurity: new URL("../public/UI/Settings/SettingsSecurity.png", import.meta.url).href,
    personalInfo: new URL("../public/UI/Settings/Personalinfo.png", import.meta.url).href,
    notifHeader: new URL("../public/UI/Settings/SettingsNotiWhite.png", import.meta.url).href,
    emailNoti: new URL("../public/UI/Settings/EmailNoti.png", import.meta.url).href,
    pushNoti: new URL("../public/UI/Settings/Pushnoti.png", import.meta.url).href,
    save: new URL("../public/UI/Settings/SaveChanges.png", import.meta.url).href,
    securityHeader: new URL("../public/UI/Settings/SettingsSecurityWhite.png", import.meta.url).href,
    changePassword: new URL("../public/UI/Settings/ChangePassword.png", import.meta.url).href,
    deleteTitle: new URL("../public/UI/Settings/DeleteAccountRed.png", import.meta.url).href,
    deleteBtn: new URL("../public/UI/Settings/DeleteAccountWhite.png", import.meta.url).href,
};
function SettingsUiImg({ src, className = "h-5 w-5" }) {
    return _jsx("img", { src: src, alt: "", width: 20, height: 20, className: `shrink-0 object-contain ${className}`, "aria-hidden": true });
}
function tabClass(active) {
    return `flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active
        ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-800 dark:text-white"
        : "text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white"}`;
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
            // Не задавать Content-Type вручную — axios сам добавит boundary для multipart.
            const { data } = await api.post("/settings/avatar", formData);
            setAvatarUrl(data.avatarUrl ?? "");
            setNotice("Аватар загружен и сохранён на сервере.");
        }
        catch (err) {
            setNotice(getAxiosErrorMessage(err, "Не удалось загрузить аватар. Форматы: jpg/png/gif/webp, до 2MB."));
        }
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl space-y-5", children: [_jsxs("section", { children: [_jsx("h1", { className: "text-5xl font-black text-slate-900 dark:text-white", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("p", { className: "mt-2 text-slate-500 dark:text-neutral-400", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u0441\u0432\u043E\u0438\u043C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u043E\u043C \u0438 \u043F\u0440\u0435\u0434\u043F\u043E\u0447\u0442\u0435\u043D\u0438\u044F\u043C\u0438" })] }), notice ? (_jsx("div", { className: "rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300", children: notice })) : null, _jsxs("section", { className: "flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-neutral-900", children: [_jsxs("button", { type: "button", onClick: () => setTab("profile"), className: tabClass(tab === "profile"), children: [_jsx(SettingsUiImg, { src: settingsUi.tabProfile, className: "h-5 w-5" }), "\u041F\u0440\u043E\u0444\u0438\u043B\u044C"] }), _jsxs("button", { type: "button", onClick: () => setTab("notifications"), className: tabClass(tab === "notifications"), children: [_jsx(SettingsUiImg, { src: settingsUi.tabNotif, className: "h-5 w-5" }), "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F"] }), _jsxs("button", { type: "button", onClick: () => setTab("security"), className: tabClass(tab === "security"), children: [_jsx(SettingsUiImg, { src: settingsUi.tabSecurity, className: "h-5 w-5" }), "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C"] })] }), tab === "profile" ? (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 p-3 shadow-sm", children: _jsx("img", { src: settingsUi.personalInfo, alt: "", width: 32, height: 32, className: "h-8 w-8 object-contain", "aria-hidden": true }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u041B\u0438\u0447\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F" }), _jsx("p", { className: "text-slate-500 dark:text-neutral-400", children: "\u041E\u0431\u043D\u043E\u0432\u0438 \u0441\u0432\u043E\u0439 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0438 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u0410\u0432\u0430\u0442\u0430\u0440" }), _jsxs("div", { className: "flex items-center gap-3", children: [avatarUrl ? (_jsx("img", { src: mediaUrl(avatarUrl), alt: "\u0410\u0432\u0430\u0442\u0430\u0440 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", className: "h-20 w-20 rounded-full object-cover" }, avatarUrl)) : (_jsx("div", { className: "flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-500 p-4", children: _jsx("img", { src: settingsUi.personalInfo, alt: "", width: 48, height: 48, className: "h-12 w-12 object-contain", "aria-hidden": true }) })), _jsxs("div", { children: [_jsx("input", { ref: avatarInputRef, type: "file", accept: "image/png,image/jpeg,image/jpg,image/gif,image/webp", className: "hidden", onChange: (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file)
                                                                uploadAvatar(file);
                                                        } }), _jsx("button", { type: "button", onClick: () => avatarInputRef.current?.click(), className: "rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:text-neutral-100", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E" }), _jsx("p", { className: "mt-1 text-xs text-slate-500 dark:text-neutral-400", children: "JPG, PNG, GIF, WEBP. \u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C 2MB." })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u041F\u043E\u043B\u043D\u043E\u0435 \u0438\u043C\u044F" }), _jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }), _jsx("input", { value: username, onChange: (e) => setUsername(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" }), usernameError ? _jsx("p", { className: "mt-1 text-xs text-red-500", children: usernameError }) : null] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "Email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" }), emailError ? _jsx("p", { className: "mt-1 text-xs text-red-500", children: emailError }) : null] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u0421\u0441\u044B\u043B\u043A\u0430 \u043D\u0430 \u0430\u0432\u0430\u0442\u0430\u0440" }), _jsx("input", { value: avatarUrl, onChange: (e) => setAvatarUrl(e.target.value), className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100", placeholder: "https://\u2026 \u0438\u043B\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438 \u0444\u0430\u0439\u043B \u0432\u044B\u0448\u0435 (\u043D\u0435 \u0432\u0441\u0442\u0430\u0432\u043B\u044F\u0439 \u0442\u043E\u043B\u044C\u043A\u043E photo-\u2026 \u0431\u0435\u0437 \u0434\u043E\u043C\u0435\u043D\u0430)" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u041E \u0441\u0435\u0431\u0435" }), _jsx("textarea", { value: bio, onChange: (e) => setBio(e.target.value.slice(0, 200)), rows: 3, className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" }), _jsxs("p", { className: "mt-1 text-xs text-slate-500 dark:text-neutral-400", children: [bioCount, "/200 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432"] })] }), _jsxs("button", { type: "button", onClick: saveProfile, className: "mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: [_jsx(SettingsUiImg, { src: settingsUi.save, className: "h-5 w-5" }), "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"] })] })] })) : null, tab === "notifications" ? (_jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500", children: _jsx(SettingsUiImg, { src: settingsUi.notifHeader, className: "h-8 w-8" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-slate-500 dark:text-neutral-400", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439, \u043A\u0430\u043A \u0438 \u043A\u043E\u0433\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800", children: [_jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [_jsx(SettingsUiImg, { src: settingsUi.emailNoti, className: "mt-0.5 h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: "Email \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-neutral-400", children: "\u041F\u043E\u043B\u0443\u0447\u0430\u0439 \u0432\u0430\u0436\u043D\u044B\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043D\u0430 \u043F\u043E\u0447\u0442\u0443" })] })] }), _jsx("button", { type: "button", onClick: () => setEmailNotifications((v) => !v), className: `h-7 w-12 shrink-0 rounded-full transition ${emailNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-neutral-800"}` })] }), _jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800", children: [_jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [_jsx(SettingsUiImg, { src: settingsUi.pushNoti, className: "mt-0.5 h-6 w-6" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: "Push \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-neutral-400", children: "\u041F\u043E\u043B\u0443\u0447\u0430\u0439 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435" })] })] }), _jsx("button", { type: "button", onClick: () => setPushNotifications((v) => !v), className: `h-7 w-12 shrink-0 rounded-full transition ${pushNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-neutral-800"}` })] })] }), _jsxs("button", { type: "button", onClick: saveNotifications, className: "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: [_jsx(SettingsUiImg, { src: settingsUi.save, className: "h-5 w-5" }), "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"] })] })) : null, tab === "security" ? (_jsxs("section", { className: "space-y-4", children: [_jsxs("article", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950", children: [_jsxs("div", { className: "mb-4 flex items-center gap-3", children: [_jsx("div", { className: "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-500", children: _jsx(SettingsUiImg, { src: settingsUi.securityHeader, className: "h-8 w-8" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-black text-slate-900 dark:text-white", children: "\u0411\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C" }), _jsx("p", { className: "text-slate-500 dark:text-neutral-400", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439 \u043F\u0430\u0440\u043E\u043B\u0435\u043C \u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u044C\u044E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430" })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: newPassword, onChange: (e) => setNewPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), type: "password", className: "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100", placeholder: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" })] })] }), _jsxs("button", { type: "button", onClick: changePassword, className: "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600", children: [_jsx(SettingsUiImg, { src: settingsUi.changePassword, className: "h-5 w-5" }), "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C"] })] }), _jsxs("article", { className: "rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm dark:border-red-500/30 dark:bg-red-500/5", children: [_jsxs("h3", { className: "flex items-center gap-2 text-3xl font-black text-red-600 dark:text-red-400", children: [_jsx(SettingsUiImg, { src: settingsUi.deleteBtn, className: "h-9 w-9" }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442"] }), _jsx("p", { className: "mt-1 text-sm text-red-500 dark:text-red-300", children: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u0432\u0441\u0435 \u0442\u0432\u043E\u0438 \u0434\u0430\u043D\u043D\u044B\u0435, \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0431\u0443\u0434\u0443\u0442 \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E \u0443\u0434\u0430\u043B\u0435\u043D\u044B." }), _jsxs("button", { type: "button", onClick: () => setIsDeleteModalOpen(true), className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700", children: [_jsx(SettingsUiImg, { src: settingsUi.deleteTitle, className: "h-5 w-5" }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043C\u043E\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442"] })] })] })) : null, isDeleteModalOpen ? (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4", children: _jsxs("div", { className: "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950", children: [_jsx("h3", { className: "text-xl font-black text-slate-900 dark:text-white", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430?" }), _jsx("p", { className: "mt-2 text-sm text-slate-500 dark:text-neutral-400", children: "\u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E. \u0412\u0435\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0435\u043D." }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsDeleteModalOpen(false), className: "flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-neutral-800 dark:text-neutral-100", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "button", onClick: confirmDeleteAccount, className: "flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }) })) : null] }));
}
