import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
    }),

  logout: () =>
    set({
      accessToken: null,
      user: null,
    }),

  isAuthenticated: () => !!get().accessToken,
}));