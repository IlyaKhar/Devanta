/** Email после логина — для приветствия на главной (имя из части до @). */
const KEY = "devanta_user_email";
export function setUserEmail(email) {
    localStorage.setItem(KEY, email.trim().toLowerCase());
}
export function clearUserEmail() {
    localStorage.removeItem(KEY);
}
/** Имя для UI: первая буква заглавная; без email — нейтральное обращение. */
export function getDisplayName() {
    const raw = localStorage.getItem(KEY);
    if (!raw)
        return "Ученик";
    const local = raw.split("@")[0] ?? "ученик";
    if (!local)
        return "Ученик";
    return local.charAt(0).toUpperCase() + local.slice(1);
}
