import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AcademicAdapter } from '@/lib/functional/adapters/academic-adapter';
import { AssessmentAdapter } from '@/lib/functional/adapters/assessment-adapter';
import { StudentAdapter } from '@/lib/functional/adapters/student-adapter';
import { GradingAdapter } from '@/lib/functional/adapters/grading-adapter';
import { StudentResultAdapter } from '@/lib/functional/adapters/student-result-adapter';
import { AssessmentCreateRequest, AssessmentResultInput, AssessmentUpdateRequest } from '@/lib/functional/types';
import { apiClient } from '@/lib/api/client';

export const assessmentKeys = {
  all: ['assessments'] as const,
  detail: (id: string) => ['assessments', id] as const,
  results: (id: string) => ['assessments', id, 'results'] as const,
  references: ['assessment-references'] as const,
  roster: (classId: string, academicYearId: string) => ['assessment-roster', classId, academicYearId] as const,
};

export function useAssessments() {
  return useQuery({ queryKey: assessmentKeys.all, queryFn: () => AssessmentAdapter.getAssessments() });
}
export function useAssessment(id: string) {
  return useQuery({ queryKey: assessmentKeys.detail(id), queryFn: () => AssessmentAdapter.getAssessment(id), enabled: Boolean(id) });
}

export function useAssessmentResults(id: string) {
  return useQuery({ queryKey: assessmentKeys.results(id), queryFn: () => AssessmentAdapter.getAssessmentResults(id), enabled: Boolean(id) });
}

export function usePreviewAssessmentResults(id: string, inputs: AssessmentResultInput[]) {
  const values = inputs.filter((input) => input.score !== null && input.score !== undefined);
  return useQuery({
    queryKey: ['assessment-result-preview', id, values],
    queryFn: () => AssessmentAdapter.previewAssessmentResults(id, values),
    enabled: Boolean(id && values.length),
  });
}

export function useAssessmentReferences() {
  return useQuery({
    queryKey: assessmentKeys.references,
    queryFn: async () => {
      const [academicYears, classes, subjects, myAssignments] = await Promise.all([
        AcademicAdapter.getAcademicYears(),
        AcademicAdapter.getSchoolClasses(),
        AcademicAdapter.getSubjects(),
        AcademicAdapter.getMyTeacherAssignments(),
      ]);
      const termsByYear = await Promise.all(academicYears.map((year) => AcademicAdapter.getTerms(year.id)));
      const categories = await GradingAdapter.getCategories();
      return { academicYears, classes, subjects, terms: termsByYear.flat(), categories, myAssignments };
    },
  });
}

export function useAssessmentPolicy() {
  return useQuery({ queryKey: ['assessment-policy'], queryFn: () => GradingAdapter.getPolicy() });
}

export function useStudentReportCard(studentId: string, academicYearId: string, termId: string) {
  return useQuery({
    queryKey: ['student-results', studentId, academicYearId, termId],
    queryFn: () => StudentResultAdapter.getReportCard(studentId, academicYearId, termId),
    enabled: Boolean(studentId && academicYearId && termId),
  });
}

export function useUpdateAssessmentPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof GradingAdapter.updatePolicy>[0]) => GradingAdapter.updatePolicy(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessment-policy'] }),
  });
}

export function useGradingSchemes() {
  return useQuery({ queryKey: ['grading-schemes'], queryFn: () => GradingAdapter.getSchemes() });
}

export function useCreateGradingScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description: string }) => GradingAdapter.createScheme(name, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grading-schemes'] }),
  });
}

export function useGradeBands(schemeId: string) {
  return useQuery({
    queryKey: ['grading-schemes', schemeId, 'bands'],
    queryFn: () => GradingAdapter.getBands(schemeId),
    enabled: Boolean(schemeId)
  });
}

export function useSaveGradeBand(schemeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { bandId?: string } & Parameters<typeof GradingAdapter.createBand>[1]) => {
      if (input.bandId) {
        return GradingAdapter.updateBand(schemeId, input.bandId, input);
      }
      return GradingAdapter.createBand(schemeId, input);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grading-schemes', schemeId, 'bands'] }),
  });
}

export function useDeleteGradeBand(schemeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bandId: string) => GradingAdapter.deleteBand(schemeId, bandId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['grading-schemes', schemeId, 'bands'] }),
  });
}

export function useCreateAssessmentCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => GradingAdapter.createCategory(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.references }),
  });
}

export function useAssessmentRoster(teacherAssignmentId: string) {
  return useQuery({
    queryKey: ['assessment-roster', teacherAssignmentId],
    enabled: Boolean(teacherAssignmentId),
    queryFn: async () => {
      return AcademicAdapter.getTeacherAssignmentRoster(teacherAssignmentId);
    },
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssessmentCreateRequest) => AssessmentAdapter.createAssessment(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
  });
}

export function useUpdateAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssessmentUpdateRequest) => AssessmentAdapter.updateAssessment(id, input),
    onSuccess: (assessment) => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessment.id) }),
    ]),
  });
}

export function useRejectAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => AssessmentAdapter.rejectAssessment(id, reason),
    onSuccess: (assessment) => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(assessment.id) }),
    ]),
  });
}

export function useSubmitAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AssessmentAdapter.submitAssessment(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
    ]),
  });
}

export function useReviewAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AssessmentAdapter.approveAssessment(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
    ]),
  });
}

export function usePublishAssessment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AssessmentAdapter.publishAssessment(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
      queryClient.invalidateQueries({ queryKey: ['student-results'] }),
    ]),
  });
}

export function useSaveAssessmentResult(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssessmentResultInput) => AssessmentAdapter.saveAssessmentResult(id, input),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.results(id) }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
    ]),
  });
}

export function useSaveAssessmentResults(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inputs: AssessmentResultInput[]) => AssessmentAdapter.saveAssessmentResults(id, inputs),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.results(id) }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
      queryClient.invalidateQueries({ queryKey: ['student-results'] }),
    ]),
  });
}

export function useFinalizeAssessmentResults(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => AssessmentAdapter.finalizeAssessmentResults(id),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: assessmentKeys.results(id) }),
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) }),
      queryClient.invalidateQueries({ queryKey: ['student-results'] }),
    ]),
  });
}

export function useSaveReportCardComments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string, academicYearId: string, termId: string, classTeacherComment?: string, headTeacherComment?: string }) => 
      StudentResultAdapter.saveComments(data.studentId, data.academicYearId, data.termId, data.classTeacherComment, data.headTeacherComment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-results', variables.studentId, variables.academicYearId, variables.termId] });
    }
  });
}
export function usePublishReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ studentId, academicYearId, termId }: { studentId: string; academicYearId: string; termId: string }) => {
      const { apiClient } = await import("@/lib/api/client");
      const response = await apiClient(`/reporting/snapshots/student/${studentId}/publish`, { method: "POST", body: JSON.stringify({ academicYearId, termId }) });
      return response;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["student-results", variables.studentId] });
    },
  });
}

export function useGenerateReportCardPdf() {
  return useMutation({
    mutationFn: async ({ studentId, academicYearId, termId }: { studentId: string; academicYearId: string; termId: string }) => {
      return StudentResultAdapter.generateReportCardPdf(studentId, academicYearId, termId);
    },
  });
}
