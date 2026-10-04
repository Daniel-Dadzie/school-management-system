import { CalendarService } from "@/lib/functional/services/calendar-service";
import type { CalendarEventRecord } from "@/lib/functional/types";

type CalendarEventInput = Omit<CalendarEventRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">;
type CalendarEventPatch = Partial<CalendarEventInput>;

export const CalendarAdapter = {
  listEvents(tenantId: string): CalendarEventRecord[] {
    return CalendarService.list(tenantId);
  },

  createEvent(data: CalendarEventInput): CalendarEventRecord {
    return CalendarService.create(data);
  },

  updateEvent(id: string, patch: CalendarEventPatch): CalendarEventRecord {
    return CalendarService.update(id, patch);
  },

  deleteEvent(id: string): void {
    CalendarService.delete(id);
  },
};
