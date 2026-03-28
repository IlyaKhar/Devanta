import axios from "axios";
import { useAuthStore } from "../store/auth";

/** Текст для UI: раньше String(undefined) превращался в строку "undefined". */
export function getAxiosErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) return fallback;
  const data = err.response?.data;
  if (typeof data === "object" && data !== null && "message" in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  const status = err.response?.status;
  if (status === 502 || status === 503) {
    return "Сервер недоступен (ошибка шлюза). Проверь, что контейнер backend запущен: docker compose ps и docker compose logs backend.";
  }
  if (status === 404) return "Запрос не найден. Проверь адрес API.";
  if (typeof data === "string" && data.trim()) return data.slice(0, 300);
  return err.message || fallback;
}

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
