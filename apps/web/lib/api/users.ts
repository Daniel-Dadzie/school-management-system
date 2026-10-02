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
  middleName?: string;
  preferredName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  lastLoginAt?: string;
  teacherProfile?: { staffId: string; qualification?: string; specialization?: string; employmentDate?: string };
}

export interface UserCreateRequest {
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  preferredName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  teacherProfile?: { staffId: string; qualification?: string; specialization?: string; employmentDate?: string };
}

export type UserUpdateRequest = Partial<UserCreateRequest> & { isActive?: boolean };

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
  updateUser: (id: string, data: UserUpdateRequest) => apiClient<UserResponse>(`/users/${id}`, {
    method: "PATCH", body: JSON.stringify(data), requiresAuth: true,
  }),
  setActive: (id: string, isActive: boolean) => apiClient<UserResponse>(`/users/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ isActive }), requiresAuth: true,
  }),
};

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: () => UserAdapter.getUsers() });
}

export function useMyProfile() {
  return useQuery({ queryKey: ["my-profile"], queryFn: () => UserAdapter.getMyProfile() });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Pick<UserUpdateRequest, "firstName" | "middleName" | "lastName" | "preferredName" | "gender" | "dateOfBirth" | "phone" | "address">) => UserAdapter.updateMyProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(["my-profile"], user);
      queryClient.invalidateQueries({ queryKey: ["users", String(user.id)] });
    },
  });
}

export function useUser(id: string) {
  return useQuery({ queryKey: ["users", id], queryFn: () => UserAdapter.getUser(id), enabled: Boolean(id) });
}

export function useUserActivity(id: string) {
  return useQuery({ queryKey: ["users", id, "activity"], queryFn: () => UserAdapter.getActivity(id), enabled: Boolean(id) });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreateRequest) => UserAdapter.createUser(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", String(user.id)], user);
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserUpdateRequest) => UserAdapter.updateUser(id, data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", id], user);
    },
  });
}

export function useSetUserActive(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => UserAdapter.setActive(id, isActive),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["users", id], user);
    },
  });
}
