import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

// ============================================================================
// Types & Enums
// ============================================================================

export type AssignmentStatus = "ACTIVE" | "INACTIVE";
export type EnrollmentStatus = "ACTIVE" | "SUSPENDED" | "TRANSFERRED" | "WITHDRAWN";

export interface AcademicYearResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface TermResponse {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isMandatory: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TermRequest {
  name: string;
  startDate: string;
  endDate: string;
  isMandatory: boolean;
}

export interface SchoolClassResponse {
  id: string;
  name: string;
  level: string;
  capacity?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolClassRequest {
  name: string;
  level: string;
  capacity?: number;
}

export interface SubjectResponse {
  id: string;
  name: string;
  code: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubjectRequest {
  name: string;
  code: string;
  department?: string;
}

export interface TeacherAssignmentResponse {
  id: string;
  teacherId: string;
  subjectId: string;
  schoolClassId: string;
  academicYearId: string;
  termId: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface TeacherAssignmentRequest {
  teacherId: string;
  subjectId: string;
  schoolClassId: string;
  academicYearId: string;
  termId: string;
}

export interface EnrollmentResponse {
  id: string;
  studentId: string;
  schoolClassId: string;
  academicYearId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EnrollmentRequest {
  studentId: string;
  schoolClassId: string;
  academicYearId: string;
}

// ============================================================================
// Raw API Client Callers
// ============================================================================

export async function fetchAcademicYears(): Promise<AcademicYearResponse[]> {
  return apiClient<AcademicYearResponse[]>("/academic-years");
}

export async function postAcademicYear(data: AcademicYearRequest): Promise<AcademicYearResponse> {
  return apiClient<AcademicYearResponse>("/academic-years", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchTerms(academicYearId: string): Promise<TermResponse[]> {
  return apiClient<TermResponse[]>(`/academic-years/${academicYearId}/terms`);
}

export async function postTerm(academicYearId: string, data: TermRequest): Promise<TermResponse> {
  return apiClient<TermResponse>(`/academic-years/${academicYearId}/terms`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchSchoolClasses(): Promise<SchoolClassResponse[]> {
  return apiClient<SchoolClassResponse[]>("/classes");
}

export async function postSchoolClass(data: SchoolClassRequest): Promise<SchoolClassResponse> {
  return apiClient<SchoolClassResponse>("/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchSubjects(): Promise<SubjectResponse[]> {
  return apiClient<SubjectResponse[]>("/subjects");
}

export async function postSubject(data: SubjectRequest): Promise<SubjectResponse> {
  return apiClient<SubjectResponse>("/subjects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchTeacherAssignments(): Promise<TeacherAssignmentResponse[]> {
  return apiClient<TeacherAssignmentResponse[]>("/teacher-assignments");
}

export async function fetchMyTeacherAssignments(): Promise<TeacherAssignmentResponse[]> {
  return apiClient<TeacherAssignmentResponse[]>("/teacher-assignments/me");
}

export async function postTeacherAssignment(data: TeacherAssignmentRequest): Promise<TeacherAssignmentResponse> {
  return apiClient<TeacherAssignmentResponse>("/teacher-assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patchTeacherAssignmentStatus(
  id: string,
  status: AssignmentStatus
): Promise<TeacherAssignmentResponse> {
  return apiClient<TeacherAssignmentResponse>(`/teacher-assignments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchEnrollments(): Promise<EnrollmentResponse[]> {
  return apiClient<EnrollmentResponse[]>("/enrollments");
}

export async function postEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  return apiClient<EnrollmentResponse>("/enrollments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patchEnrollmentStatus(
  id: string,
  status: EnrollmentStatus
): Promise<EnrollmentResponse> {
  return apiClient<EnrollmentResponse>(`/enrollments/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ============================================================================
// React Query Hooks
// ============================================================================

export function useAcademicYears() {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: fetchAcademicYears,
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });
}

export function useTerms(academicYearId?: string) {
  return useQuery({
    queryKey: ["terms", academicYearId],
    queryFn: () => (academicYearId ? fetchTerms(academicYearId) : Promise.resolve([])),
    enabled: !!academicYearId,
  });
}

export function useCreateTerm(academicYearId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TermRequest) => postTerm(academicYearId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms", academicYearId] });
    },
  });
}

export function useSchoolClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: fetchSchoolClasses,
  });
}

export function useCreateSchoolClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postSchoolClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useTeacherAssignments(isTeacher = false) {
  return useQuery({
    queryKey: ["teacher-assignments", isTeacher ? "me" : "all"],
    queryFn: isTeacher ? fetchMyTeacherAssignments : fetchTeacherAssignments,
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postTeacherAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useUpdateTeacherAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      patchTeacherAssignmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: fetchEnrollments,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnrollmentStatus }) =>
      patchEnrollmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}
