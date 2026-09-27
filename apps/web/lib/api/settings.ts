import { apiClient } from "./client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsAdapter } from "../functional/adapters/settings-adapter";

export interface SettingsResponse {
  id: string;
  institutionName: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  logoUrl?: string;
  updatedAt: string;
}

export interface SettingsRequest {
  institutionName: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  logoUrl?: string;
}

export async function fetchSettings(): Promise<SettingsResponse> {
  return apiClient<SettingsResponse>("/settings");
}

export async function updateSettings(data: SettingsRequest): Promise<SettingsResponse> {
  return apiClient<SettingsResponse>("/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => SettingsAdapter.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsRequest) => SettingsAdapter.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
