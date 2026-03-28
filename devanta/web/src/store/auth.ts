import { create } from "zustand";
import { decodeJwtPayload } from "../lib/jwtPayload";

type AuthState = {
  accessToken: string;
  role: string;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: "",
  role: "",
  setToken: (token: string) => {
    const p = token ? decodeJwtPayload(token) : null;
    set({
      accessToken: token,
      role: typeof p?.role === "string" ? p.role : "",
    });
  },
  logout: () => set({ accessToken: "", role: "" }),
}));
