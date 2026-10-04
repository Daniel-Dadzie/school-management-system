import { DisciplineService } from "@/lib/functional/services/discipline-service";
import { useAuthStore } from "@/stores/auth-store";
import type { IncidentRecord } from "@/lib/functional/types";

export const DisciplineAdapter = {
  listIncidents(): IncidentRecord[] {
    const { user } = useAuthStore.getState();
    return DisciplineService.list(user?.tenantId ?? "tenant-1");
  },

  createIncident(data: Omit<IncidentRecord, "id" | "createdAt" | "updatedAt">): IncidentRecord {
    return DisciplineService.create(data);
  },

  updateIncident(id: string, patch: Partial<IncidentRecord>): IncidentRecord {
    return DisciplineService.update(id, patch);
  },

  deleteIncident(id: string): void {
    DisciplineService.delete(id);
  },
};
