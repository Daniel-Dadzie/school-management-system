import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DisciplineService } from "@/lib/functional/services/discipline-service";
import type { IncidentRecord } from "@/lib/functional/types";

export const disciplineKeys = {
  all: ["incidents"] as const,
  tenant: (tenantId: string) => ["incidents", tenantId] as const,
  detail: (id: string) => ["incidents", "detail", id] as const,
};

export type IncidentInput = Omit<IncidentRecord, "id" | "createdAt" | "updatedAt">;

export function useIncidents(tenantId?: string, enabled = true) {
  return useQuery({
    queryKey: tenantId ? disciplineKeys.tenant(tenantId) : disciplineKeys.all,
    queryFn: () => DisciplineService.list(tenantId!),
    enabled: Boolean(tenantId) && enabled,
  });
}

export function useIncident(id: string, enabled = true) {
  return useQuery({
    queryKey: disciplineKeys.detail(id),
    queryFn: () => DisciplineService.getById(id),
    enabled: Boolean(id) && enabled,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: IncidentInput) => DisciplineService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<IncidentRecord> }) => DisciplineService.update(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => DisciplineService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: disciplineKeys.all }),
  });
}
