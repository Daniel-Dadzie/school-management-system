import { AcademicAdapter } from "../functional/adapters/academic-adapter";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

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

export interface AcademicTeacherOption {
  id: string;
  displayName: string;
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
    queryFn: () => AcademicAdapter.getAcademicYears(),
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AcademicYearRequest) => AcademicAdapter.createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });
}

export function useTerms(academicYearId?: string) {
  return useQuery({
    queryKey: ["terms", academicYearId],
    queryFn: () => (academicYearId ? AcademicAdapter.getTerms(academicYearId) : Promise.resolve([])),
    enabled: !!academicYearId,
  });
}

export function useAccessibleTerms() {
  const yearsQuery = useAcademicYears();
  const termsQueries = useQueries({
    queries: (yearsQuery.data ?? []).map((year) => ({
      queryKey: ["terms", year.id],
      queryFn: () => AcademicAdapter.getTerms(year.id),
    })),
  });

  return {
    data: termsQueries.flatMap((query) => query.data ?? []),
    isLoading: yearsQuery.isLoading || termsQueries.some((query) => query.isLoading),
    isError: yearsQuery.isError || termsQueries.some((query) => query.isError),
    refetch: async () => {
      await Promise.all([yearsQuery.refetch(), ...termsQueries.map((query) => query.refetch())]);
    },
  };
}

export function useCreateTerm(academicYearId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TermRequest) => AcademicAdapter.createTerm(academicYearId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terms", academicYearId] });
    },
  });
}

export function useSchoolClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicAdapter.getSchoolClasses(),
  });
}

export function useCreateSchoolClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SchoolClassRequest) => AcademicAdapter.createSchoolClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: () => AcademicAdapter.getSubjects(),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubjectRequest) => AcademicAdapter.createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useTeacherAssignments(isTeacher = false) {
  const teacherId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["teacher-assignments", isTeacher ? "me" : "all"],
    queryFn: isTeacher ? () => AcademicAdapter.getMyTeacherAssignments(teacherId) : () => AcademicAdapter.getTeacherAssignments(),
  });
}

export function useAcademicTeacherOptions() {
  return useQuery({
    queryKey: ["academic-teacher-options"],
    queryFn: () => AcademicAdapter.getTeacherOptions(),
  });
}

export function useCreateTeacherAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TeacherAssignmentRequest) => AcademicAdapter.createTeacherAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useUpdateTeacherAssignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AssignmentStatus }) =>
      AcademicAdapter.updateTeacherAssignmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
}

export function useEnrollments(enabled = true) {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: () => AcademicAdapter.getEnrollments(),
    enabled,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnrollmentRequest) => AcademicAdapter.createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EnrollmentStatus }) =>
      AcademicAdapter.updateEnrollmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
}

// ============================================================================
// Curriculum Offerings
// ============================================================================

export interface CurriculumOfferingResponse {
  id: string;
  academicYearId: string;
  gradeLevel: string;
  subject: SubjectResponse;
  isRequired: boolean;
  isActive: boolean;
  periodsPerWeek?: number;
  assessmentEnabled: boolean;
  reportEnabled: boolean;
}

export interface CurriculumOfferingRequest {
  academicYearId: string;
  gradeLevel: string;
  subjectId: string;
  isRequired: boolean;
  isActive: boolean;
  periodsPerWeek?: number;
  assessmentEnabled: boolean;
  reportEnabled: boolean;
}

export async function fetchCurriculumOfferings(academicYearId: string, gradeLevel?: string): Promise<CurriculumOfferingResponse[]> {
  const url = new URL("/api/v1/academic/curriculum-offerings", window.location.origin);
  url.searchParams.append("academicYearId", academicYearId);
  if (gradeLevel) {
    url.searchParams.append("gradeLevel", gradeLevel);
  }
  return apiClient<CurriculumOfferingResponse[]>(url.pathname + url.search);
}

export async function postCurriculumOffering(data: CurriculumOfferingRequest): Promise<CurriculumOfferingResponse> {
  return apiClient<CurriculumOfferingResponse>("/academic/curriculum-offerings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function putCurriculumOffering(id: string, data: CurriculumOfferingRequest): Promise<CurriculumOfferingResponse> {
  return apiClient<CurriculumOfferingResponse>("/academic/curriculum-offerings/" + id, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCurriculumOffering(id: string): Promise<void> {
  return apiClient<void>("/academic/curriculum-offerings/" + id, {
    method: "DELETE",
  });
}

export function useCurriculumOfferings(academicYearId?: string, gradeLevel?: string) {
  return useQuery({
    queryKey: ["curriculumOfferings", academicYearId, gradeLevel],
    queryFn: () => {
      if (!academicYearId) return Promise.resolve([]);
      return fetchCurriculumOfferings(academicYearId, gradeLevel);
    },
    enabled: !!academicYearId,
  });
}

export function useCreateCurriculumOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postCurriculumOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculumOfferings"] });
    },
  });
}

export function useUpdateCurriculumOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CurriculumOfferingRequest }) =>
      putCurriculumOffering(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculumOfferings"] });
    },
  });
}

export function useDeleteCurriculumOffering() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCurriculumOffering,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["curriculumOfferings"] });
    },
  });
}

// ============================================================================
// Timetable Periods
// ============================================================================

export type PeriodType = "LESSON" | "BREAK" | "ASSEMBLY" | "SPORT" | "OTHER";

export interface TimetablePeriodResponse {
  id: string;
  name: string;
  startTime: string;  // "HH:mm:ss"
  endTime: string;
  type: PeriodType;
  sortOrder: number;
}

export interface TimetablePeriodRequest {
  name: string;
  startTime: string;
  endTime: string;
  type?: PeriodType;
  sortOrder?: number;
}

export async function fetchTimetablePeriods(): Promise<TimetablePeriodResponse[]> {
  return apiClient<TimetablePeriodResponse[]>("/academic/timetable/periods");
}

export async function postTimetablePeriod(data: TimetablePeriodRequest): Promise<TimetablePeriodResponse> {
  return apiClient<TimetablePeriodResponse>("/academic/timetable/periods", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function putTimetablePeriod(id: string, data: TimetablePeriodRequest): Promise<TimetablePeriodResponse> {
  return apiClient<TimetablePeriodResponse>(`/academic/timetable/periods/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTimetablePeriod(id: string): Promise<void> {
  return apiClient<void>(`/academic/timetable/periods/${id}`, { method: "DELETE" });
}

export function useTimetablePeriods() {
  return useQuery({
    queryKey: ["timetablePeriods"],
    queryFn: fetchTimetablePeriods,
  });
}

export function useCreateTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postTimetablePeriod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetablePeriods"] }),
  });
}

export function useUpdateTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimetablePeriodRequest }) => putTimetablePeriod(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetablePeriods"] }),
  });
}

export function useDeleteTimetablePeriod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTimetablePeriod,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetablePeriods"] }),
  });
}

// ============================================================================
// Timetable Entries
// ============================================================================

export interface TimetableEntryResponse {
  id: string;
  termId: string;
  schoolClassId: string;
  schoolClassName: string;
  periodId: string;
  periodName: string;
  dayOfWeek: number;       // 1=Mon, 5=Fri
  subjectId: string | null;
  subjectName: string | null;
  teacherId: string | null;
  teacherName: string | null;
  activityName: string | null;
}

export interface TimetableEntryRequest {
  academicYearId: string;
  termId: string;
  schoolClassId: string;
  periodId: string;
  dayOfWeek: number;
  subjectId?: string | null;
  teacherId?: string | null;
  activityName?: string | null;
}

export async function fetchTimetableEntries(termId: string, classId: string): Promise<TimetableEntryResponse[]> {
  return apiClient<TimetableEntryResponse[]>(`/academic/timetable/entries`, {
    params: { termId, classId },
  });
}

export async function postTimetableEntry(data: TimetableEntryRequest): Promise<TimetableEntryResponse> {
  return apiClient<TimetableEntryResponse>("/academic/timetable/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteTimetableEntry(id: string): Promise<void> {
  return apiClient<void>(`/academic/timetable/entries/${id}`, { method: "DELETE" });
}

export function useTimetableEntries(termId?: string, classId?: string) {
  return useQuery({
    queryKey: ["timetableEntries", termId, classId],
    queryFn: () => fetchTimetableEntries(termId!, classId!),
    enabled: !!termId && !!classId,
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postTimetableEntry,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timetableEntries", variables.termId, variables.schoolClassId] });
    },
  });
}

export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, termId, classId }: { id: string; termId: string; classId: string }) =>
      deleteTimetableEntry(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timetableEntries", variables.termId, variables.classId] });
    },
  });
}

export interface TeacherAssignmentRosterResponse {
  enrollmentId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
}

export async function fetchTeacherAssignmentRoster(id: string): Promise<TeacherAssignmentRosterResponse[]> {
  return apiClient<TeacherAssignmentRosterResponse[]>(`/teacher-assignments/${id}/students`);
}


