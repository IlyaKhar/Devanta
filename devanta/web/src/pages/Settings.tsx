import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuthStore } from "../store/auth";

type SettingsTab = "profile" | "notifications" | "security";

function tabClass(active: boolean) {
  return `flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
    active
      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
      const { data } = await api.post<{ avatarUrl: string }>("/settings/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(data.avatarUrl ?? "");
      setNotice("Аватар обновлен. Нажми сохранить профиль.");
    } catch {
      setNotice("Не удалось загрузить аватар. Допустимо: jpg/jpeg/png/gif/webp до 2MB.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section>
        <h1 className="text-5xl font-black text-slate-900 dark:text-white">Настройки</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Управляй своим аккаунтом и предпочтениями</p>
      </section>
      {notice ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {notice}
        </div>
      ) : null}

      <section className="flex items-center gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-800">
        <button type="button" onClick={() => setTab("profile")} className={tabClass(tab === "profile")}>
          👤 Профиль
        </button>
        <button type="button" onClick={() => setTab("notifications")} className={tabClass(tab === "notifications")}>
          🔔 Уведомления
        </button>
        <button type="button" onClick={() => setTab("security")} className={tabClass(tab === "security")}>
          🔒 Безопасность
        </button>
      </section>

      {tab === "profile" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-2xl text-white">👤</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Личная информация</h2>
              <p className="text-slate-500 dark:text-slate-400">Обнови свой профиль и персональные данные</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Аватар</label>
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Аватар пользователя" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-4xl text-white">🧑‍💻</div>
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
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                    Загрузить фото
                  </button>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, GIF, WEBP. Максимум 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Полное имя</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Имя пользователя</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
              {usernameError ? <p className="mt-1 text-xs text-red-500">{usernameError}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />
              {emailError ? <p className="mt-1 text-xs text-red-500">{emailError}</p> : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Ссылка на аватар</label>
              <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="https://..." />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bioCount}/200 символов</p>
            </div>
            <button type="button" onClick={saveProfile} className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
              💾 Сохранить изменения
            </button>
          </div>
        </section>
      ) : null}

      {tab === "notifications" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-2xl text-white">🔔</div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Уведомления</h2>
              <p className="text-slate-500 dark:text-slate-400">Настрой, как и когда получать уведомления</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Email уведомления</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Получай важные обновления на почту</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications((v) => !v)}
                className={`h-7 w-12 rounded-full transition ${emailNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Push уведомления</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Получай уведомления в браузере</p>
              </div>
              <button
                type="button"
                onClick={() => setPushNotifications((v) => !v)}
                className={`h-7 w-12 rounded-full transition ${pushNotifications ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-700"}`}
              />
            </div>
          </div>

          <button type="button" onClick={saveNotifications} className="mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
            💾 Сохранить настройки
          </button>
        </section>
      ) : null}

      {tab === "security" ? (
        <section className="space-y-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-2xl text-white">🔒</div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white">Безопасность</h2>
                <p className="text-slate-500 dark:text-slate-400">Управляй паролем и безопасностью аккаунта</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Текущий пароль</label>
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Введите текущий пароль" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Новый пароль</label>
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Введите новый пароль" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Подтвердите пароль</label>
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" placeholder="Повторите новый пароль" />
              </div>
            </div>
            <button type="button" onClick={changePassword} className="mt-4 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
              🔐 Изменить пароль
            </button>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Двухфакторная аутентификация</h3>
                <p className="text-slate-500 dark:text-slate-400">Добавь дополнительный уровень защиты</p>
              </div>
              <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-slate-700">
                Настроить →
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm dark:border-red-500/30 dark:bg-red-500/5">
            <h3 className="text-3xl font-black text-red-600 dark:text-red-400">Удалить аккаунт</h3>
            <p className="mt-1 text-sm text-red-500 dark:text-red-300">
              После удаления аккаунта все твои данные, прогресс и достижения будут безвозвратно удалены.
            </p>
            <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
              🗑 Удалить мой аккаунт
            </button>
          </article>
        </section>
      ) : null}
      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Подтвердить удаление аккаунта?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Это действие необратимо. Весь прогресс будет удален.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700">
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
