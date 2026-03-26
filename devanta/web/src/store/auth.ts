import { create } from "zustand";

type AuthState = {
  accessToken: string;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: "",
  setToken: (token: string) => set({ accessToken: token }),
  logout: () => set({ accessToken: "" }),
}));
