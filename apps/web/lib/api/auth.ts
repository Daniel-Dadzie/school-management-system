import { apiClient } from "./client";
import { z } from "zod";

const ApiAuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1),
    role: z.enum(["SUPER_ADMIN", "IT_ADMIN", "ADMIN", "TEACHER", "PARENT"]),
    passwordChangeRequired: z.boolean(),
  }),
});

export type ApiAuthResponse = z.infer<typeof ApiAuthResponseSchema>;

async function readAuthResponse(request: Promise<unknown>): Promise<ApiAuthResponse> {
  return ApiAuthResponseSchema.parse(await request);
}

export const authApi = {
  login: (identifier: string, password: string) =>
    readAuthResponse(apiClient<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
      requiresAuth: false,
    })),
  refresh: () =>
    readAuthResponse(apiClient<unknown>("/auth/refresh", {
      method: "POST",
      requiresAuth: false,
    })),
  logout: () =>
    apiClient<void>("/auth/logout", {
      method: "POST",
      requiresAuth: false,
    }),
  changeInitialPassword: (currentPassword: string, newPassword: string) =>
    apiClient<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
