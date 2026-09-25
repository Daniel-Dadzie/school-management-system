import { apiClient } from "./client";

export type AdmissionStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

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

export const admissionsApi = {
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
