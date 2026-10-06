import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReportingAdapter } from '../lib/functional/adapters/reporting-adapter';
import { ReportTemplateCreateRequest, ReportTemplateUpdateRequest } from '../lib/functional/types';

export const reportingKeys = {
  all: ['reporting'] as const,
  templates: () => [...reportingKeys.all, 'templates'] as const,
  template: (id: string) => [...reportingKeys.templates(), id] as const,
};

export function useReportTemplates() {
  return useQuery({
    queryKey: reportingKeys.templates(),
    queryFn: () => ReportingAdapter.getTemplates(),
  });
}

export function useReportTemplate(id: string) {
  return useQuery({
    queryKey: reportingKeys.template(id),
    queryFn: () => ReportingAdapter.getTemplate(id),
    enabled: !!id,
  });
}

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ReportTemplateCreateRequest) => ReportingAdapter.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.templates() });
    },
  });
}

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportTemplateUpdateRequest }) => 
      ReportingAdapter.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.templates() });
      queryClient.invalidateQueries({ queryKey: reportingKeys.template(variables.id) });
    },
  });
}

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ReportingAdapter.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.templates() });
    },
  });
}

export function useGenerateReports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: import('../lib/functional/types').ReportGenerationRequest) => 
      ReportingAdapter.generateReports(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    }
  });
}

export function useReportSnapshots(academicYearId: string, termId: string, classId: string) {
  return useQuery({
    queryKey: [...reportingKeys.all, 'snapshots', academicYearId, termId, classId],
    queryFn: () => ReportingAdapter.getSnapshots(academicYearId, termId, classId),
    enabled: Boolean(academicYearId && termId && classId),
  });
}

export function usePublishSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReportingAdapter.publishSnapshot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}

export function useBulkPublishSnapshots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => ReportingAdapter.bulkPublishSnapshots(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportingKeys.all });
    },
  });
}


