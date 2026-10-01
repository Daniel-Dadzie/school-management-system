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

export interface ReportCardConfigResponse {
  id: string;
  showLogo: boolean;
  showSchoolAddress: boolean;
  showContactInformation: boolean;
  showMotto: boolean;
  showStudentPhoto: boolean;
  showDateOfBirth: boolean;
  showGender: boolean;
  showStudentId: boolean;
  showClass: boolean;
  showAcademicYear: boolean;
  showTerm: boolean;
  showTermDates: boolean;
  showReportIssueDate: boolean;
  showAssessmentBreakdown: boolean;
  showSubjectTotals: boolean;
  showGrades: boolean;
  showGradePoints: boolean;
  showRemarks: boolean;
  showAttendance: boolean;
  showPosition: boolean;
  showOverallAverage: boolean;
  showClassTeacherComment: boolean;
  showHeadTeacherComment: boolean;
  showPromotionStatus: boolean;
  showSignatureAreas: boolean;
  footerText?: string;
}

export type ReportCardConfigRequest = Partial<Omit<ReportCardConfigResponse, 'id'>>;

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

export function useReportCardConfig() {
  return useQuery({
    queryKey: ["report-card-config"],
    queryFn: () => SettingsAdapter.getReportCardConfig(),
  });
}

export function useUpdateReportCardConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportCardConfigRequest) => SettingsAdapter.updateReportCardConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-card-config"] });
    },
  });
}
