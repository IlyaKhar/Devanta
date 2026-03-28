import { create } from "zustand";
import { decodeJwtPayload } from "../lib/jwtPayload";
export const useAuthStore = create((set) => ({
    accessToken: "",
    role: "",
    setToken: (token) => {
        const p = token ? decodeJwtPayload(token) : null;
        set({
            accessToken: token,
            role: typeof p?.role === "string" ? p.role : "",
        });
    },
    logout: () => set({ accessToken: "", role: "" }),
}));
