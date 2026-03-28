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
} as const;

function SettingsUiImg({ src, className = "h-5 w-5" }: { src: string; className?: string }) {
  return <img src={src} alt="" width={20} height={20} className={`shrink-0 object-contain ${className}`} aria-hidden />;
}

type SettingsTab = "profile" | "notifications" | "security";

function tabClass(active: boolean) {
  return `flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${active
      ? "bg-white text-slate-900 shadow-sm dark:bg-neutral-800 dark:text-white"
      : "text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white"
    }`;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [tab, setTab] = useState<SettingsTab>("profile");
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
  const [notice, setNotice] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const bioCount = useMemo(() => bio.length, [bio]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{
        fullName: string;
        username: string;
        email: string;
        bio: string;
        avatarUrl: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
      }>("/settings/profile")
      .then(({ data }) => {
        if (cancelled) return;
        setFullName(data.fullName ?? "");
        setUsername(data.username ?? "");
        setEmail(data.email ?? "");
        setBio(data.bio ?? "");
        setAvatarUrl(data.avatarUrl ?? "");
        setEmailNotifications(Boolean(data.emailNotifications));
        setPushNotifications(Boolean(data.pushNotifications));
      })
      .catch(() => {
        if (!cancelled) setNotice("Не удалось загрузить настройки.");
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
    } catch {
      setNotice("Ошибка сохранения профиля.");
    }
  }

  async function saveNotifications() {
    setNotice(null);
    try {
      await api.put("/settings/notifications", { emailNotifications, pushNotifications });
      setNotice("Настройки уведомлений сохранены.");
    } catch {
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
    } catch {
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
    } catch {
      setNotice("Не удалось удалить аккаунт.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  }

  async function uploadAvatar(file: File) {
    setNotice(null);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      // Не задавать Content-Type вручную — axios сам добавит boundary для multipart.
      const { data } = await api.post<{ avatarUrl: string }>("/settings/avatar", formData);
      setAvatarUrl(data.avatarUrl ?? "");
      setNotice("Аватар загружен и сохранён на сервере.");
    } catch (err) {
      setNotice(
        getAxiosErrorMessage(err, "Не удалось загрузить аватар. Форматы: jpg/png/gif/webp, до 2MB."),
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white">Настройки</h1>
        <p className="mt-2 text-slate-500 dark:text-neutral-400">Управляй своим аккаунтом и предпочтениями</p>
      </section>
      {notice ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          {notice}
        </div>
      ) : null}

      <section className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-neutral-900">
        <button type="button" onClick={() => setTab("profile")} className={tabClass(tab === "profile")}>
          <SettingsUiImg src={settingsUi.tabProfile} className="h-5 w-5" />
          Профиль
        </button>
        <button type="button" onClick={() => setTab("notifications")} className={tabClass(tab === "notifications")}>
          <SettingsUiImg src={settingsUi.tabNotif} className="h-5 w-5" />
          Уведомления
        </button>
        <button type="button" onClick={() => setTab("security")} className={tabClass(tab === "security")}>
          <SettingsUiImg src={settingsUi.tabSecurity} className="h-5 w-5" />
          Безопасность
        </button>
      </section>

      {tab === "profile" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-4 flex items-center gap-3">
            {/* Оранжевый круг как в Figma: фон brand, поверх — белая/контурная иконка из PNG */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 p-3 shadow-sm">
              <img
                src={settingsUi.personalInfo}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Личная информация</h2>
              <p className="text-slate-500 dark:text-neutral-400">Обнови свой профиль и персональные данные</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Аватар</label>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={mediaUrl(avatarUrl)}
                    alt="Аватар пользователя"
                    className="h-20 w-20 rounded-full object-cover"
                    key={avatarUrl}
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-500 p-4">
                    <img
                      src={settingsUi.personalInfo}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 object-contain"
                      aria-hidden
                    />
                  </div>
                )}
                <div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadAvatar(file);
                    }}
                  />
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:text-neutral-100">
                    Загрузить фото
                  </button>
                  <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">JPG, PNG, GIF, WEBP. Максимум 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Полное имя</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Имя пользователя</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" />
              {usernameError ? <p className="mt-1 text-xs text-red-500">{usernameError}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" />
              {emailError ? <p className="mt-1 text-xs text-red-500">{emailError}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Ссылка на аватар</label>
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="https://… или загрузи файл выше (не вставляй только photo-… без домена)" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{bioCount}/200 символов</p>
            </div>
            <button
              type="button"
              onClick={saveProfile}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <SettingsUiImg src={settingsUi.save} className="h-5 w-5" />
              Сохранить изменения
            </button>
          </div>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500">
              <SettingsUiImg src={settingsUi.notifHeader} className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Уведомления</h2>
              <p className="text-slate-500 dark:text-neutral-400">Настрой, как и когда получать уведомления</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800">
              <div className="flex min-w-0 items-start gap-3">
                <SettingsUiImg src={settingsUi.emailNoti} className="mt-0.5 h-6 w-6" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Email уведомления</p>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">Получай важные обновления на почту</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications((v) => !v)}
                className={`h-7 w-12 shrink-0 rounded-full transition ${emailNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-neutral-800"}`}
              />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-neutral-800">
              <div className="flex min-w-0 items-start gap-3">
                <SettingsUiImg src={settingsUi.pushNoti} className="mt-0.5 h-6 w-6" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Push уведомления</p>
                  <p className="text-sm text-slate-500 dark:text-neutral-400">Получай уведомления в браузере</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifications((v) => !v)}
                className={`h-7 w-12 shrink-0 rounded-full transition ${pushNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-neutral-800"}`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveNotifications}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
          >
            <SettingsUiImg src={settingsUi.save} className="h-5 w-5" />
            Сохранить настройки
          </button>
        </section>
      ) : null}

      {tab === "security" ? (
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-500">
                <SettingsUiImg src={settingsUi.securityHeader} className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">Безопасность</h2>
                <p className="text-slate-500 dark:text-neutral-400">Управляй паролем и безопасностью аккаунта</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Текущий пароль</label>
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Введите текущий пароль" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Новый пароль</label>
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Введите новый пароль" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-neutral-200">Подтвердите пароль</label>
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100" placeholder="Повторите новый пароль" />
              </div>
            </div>
            <button
              type="button"
              onClick={changePassword}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <SettingsUiImg src={settingsUi.changePassword} className="h-5 w-5" />
              Изменить пароль
            </button>
          </article>

          <article className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm dark:border-red-500/30 dark:bg-red-500/5">
            <h3 className="flex items-center gap-2 text-3xl font-black text-red-600 dark:text-red-400">
              <SettingsUiImg src={settingsUi.deleteBtn} className="h-9 w-9" />
              Удалить аккаунт
            </h3>
            <p className="mt-1 text-sm text-red-500 dark:text-red-300">
              После удаления аккаунта все твои данные, прогресс и достижения будут безвозвратно удалены.
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <SettingsUiImg src={settingsUi.deleteTitle} className="h-5 w-5" />
              Удалить мой аккаунт
            </button>
          </article>
        </section>
      ) : null}
      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Подтвердить удаление аккаунта?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">Это действие необратимо. Весь прогресс будет удален.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-neutral-800 dark:text-neutral-100">
                Отмена
              </button>
              <button type="button" onClick={confirmDeleteAccount} className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                Удалить
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
