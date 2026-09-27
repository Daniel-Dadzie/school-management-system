import { apiClient } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAdapter } from "../functional/adapters/user-adapter";

export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "PARENT";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface UserResponse {
  id: string | number;
  username: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

// User endpoints are not implemented in the backend yet.
// We use these stubs to avoid runtime crashes, representing what the API boundary will look like.
export const usersApi = {
  getUsers: () => {
    return apiClient<UserResponse[]>("/users", { requiresAuth: true });
  },
  
  getUser: (id: string | number) => {
    return apiClient<UserResponse>(`/users/${id}`, { requiresAuth: true });
  },
  
  createUser: (data: UserCreateRequest) => {
    return apiClient<UserResponse>("/users", {
      method: "POST",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => UserAdapter.getUsers() });
}

export function useUser(id: string) {
  return useQuery({ queryKey: ["users", id], queryFn: () => UserAdapter.getUser(id), enabled: Boolean(id) });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateRequest) => UserAdapter.createUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
