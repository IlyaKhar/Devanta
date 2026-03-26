import { create } from "zustand";
export const useAuthStore = create((set) => ({
    accessToken: "",
    setToken: (token) => set({ accessToken: token }),
    logout: () => set({ accessToken: "" }),
}));
