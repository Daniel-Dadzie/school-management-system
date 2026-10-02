import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PromotionAdapter } from '@/lib/functional/adapters/promotion-adapter';
import type { PromotionInput } from '@/lib/functional/services/promotion-service';
import { isMockMode } from '@/lib/functional/config';

export const promotionKeys = {
  all: ['promotions'] as const,
  workspace: (academicYearId: string, classId: string) => ['promotions', 'workspace', academicYearId, classId] as const,
  history: (studentId: string) => ['academic-history', studentId] as const,
};

export function usePromotionWorkspace(academicYearId: string, classId: string) {
  return useQuery({
    queryKey: promotionKeys.workspace(academicYearId, classId),
    queryFn: () => PromotionAdapter.getWorkspace(academicYearId, classId),
    enabled: Boolean(academicYearId && classId),
  });
}

export function usePromotionReferences() {
  return useQuery({ queryKey: [...promotionKeys.all, 'references'], queryFn: () => PromotionAdapter.getReferences() });
}

export function useAcademicHistory(studentId: string) {
  return useQuery({
    queryKey: promotionKeys.history(studentId),
    queryFn: () => PromotionAdapter.getHistory(studentId),
    enabled: Boolean(studentId && isMockMode),
  });
}

export function useConfirmPromotions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sourceAcademicYearId: string; sourceClassId: string; records: PromotionInput[]; notes: string }) => PromotionAdapter.confirm(input),
    onSuccess: async (records) => Promise.all([
      queryClient.invalidateQueries({ queryKey: promotionKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
      queryClient.invalidateQueries({ queryKey: ['students'] }),
      ...records.map((record) => queryClient.invalidateQueries({ queryKey: promotionKeys.history(record.studentId) })),
    ]),
  });
}

export function useInitiatePromotionReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sourceAcademicYearId: string; sourceClassId: string; records: PromotionInput[] }) => PromotionAdapter.initiate(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['audit-events'] }),
  });
}
