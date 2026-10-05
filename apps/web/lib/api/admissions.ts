import { apiClient } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdmissionAdapter } from "../functional/adapters/admission-adapter";

export type AdmissionStatus = "PENDING" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "APPROVED" | "REJECTED" | "WAITLISTED";

export interface AdmissionApplicationResponse {
  id: string | number;
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  gender: string;
  applyingForClass: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  additionalNotes?: string;
  status: AdmissionStatus;
  createdAt?: string;
}

export interface AdmissionStatusUpdateRequest {
  status: AdmissionStatus;
}

export interface AdmissionApplicationRequest {
  studentFirstName: string;
  studentLastName: string;
  dateOfBirth: string;
  gender: string;
  applyingForClass: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  relationship: string;
  additionalNotes?: string;
}

export const admissionsApi = {
  apply: (data: AdmissionApplicationRequest, schoolSlug: string) => apiClient<AdmissionApplicationResponse>("/admissions", {
    method: "POST",
    body: JSON.stringify(data),
    requiresAuth: false,
    headers: { "X-School-Slug": schoolSlug },
  }),
  getApplications: () => {
    return apiClient<AdmissionApplicationResponse[]>("/admissions", { requiresAuth: true });
  },
  
  getApplication: (id: string | number) => {
    return apiClient<AdmissionApplicationResponse>(`/admissions/${id}`, { requiresAuth: true });
  },
  
  updateStatus: (id: string | number, data: AdmissionStatusUpdateRequest) => {
    return apiClient<AdmissionApplicationResponse>(`/admissions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};

export function useAdmissionApplications() {
  return useQuery({ queryKey: ["admissions"], queryFn: () => AdmissionAdapter.getApplications() });
}

export function useAdmissionApplication(id: string) {
  return useQuery({ queryKey: ["admissions", id], queryFn: () => AdmissionAdapter.getApplication(id), enabled: Boolean(id) });
}

export function useUpdateAdmissionStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionStatusUpdateRequest) => AdmissionAdapter.updateStatus(id, data),
    onSuccess: (application) => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.setQueryData(["admissions", id], application);
    },
  });
}

export function useSubmitAdmissionApplication(schoolSlug = process.env.NEXT_PUBLIC_KARATU_DEFAULT_SCHOOL_SLUG || "carepoint") {
  return useMutation({ mutationFn: (data: AdmissionApplicationRequest) => AdmissionAdapter.apply(data, schoolSlug) });
}
