import { CalendarService } from "@/lib/functional/services/calendar-service";
import { useAuthStore } from "@/stores/auth-store";
import type { CalendarEventRecord } from "@/lib/functional/types";

export const CalendarAdapter = {
  listEvents(): CalendarEventRecord[] {
    const { user } = useAuthStore.getState();
    return CalendarService.list(user?.tenantId ?? "tenant-1");
  },

  createEvent(data: Omit<CalendarEventRecord, "id" | "createdAt" | "updatedAt">): CalendarEventRecord {
    return CalendarService.create(data);
  },

  updateEvent(id: string, patch: Partial<CalendarEventRecord>): CalendarEventRecord {
    return CalendarService.update(id, patch);
  },

  deleteEvent(id: string): void {
    CalendarService.delete(id);
  },
};
