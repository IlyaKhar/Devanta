import axios from "axios";
import { useAuthStore } from "../store/auth";
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
