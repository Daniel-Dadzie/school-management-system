import { create } from "zustand";
import { isRole, type Role } from "@/lib/functional/types";

export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  tenantId?: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (accessToken: string, user: Omit<User, "role"> & { role: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,

  setAuth: (accessToken, user) => {
    if (!isRole(user.role)) throw new Error("Unsupported account role");
    set({ accessToken, user: { ...user, role: user.role } });
  },

  logout: () =>
    set({
      accessToken: null,
      user: null,
    }),

  isAuthenticated: () => !!get().accessToken,
}));
