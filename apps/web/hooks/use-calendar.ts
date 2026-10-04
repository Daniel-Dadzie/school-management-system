import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarAdapter } from "@/lib/functional/adapters/calendar-adapter";
import type { CalendarEventRecord } from "@/lib/functional/types";

export const calendarKeys = {
  all: ["calendar-events"] as const,
  tenant: (tenantId: string) => ["calendar-events", tenantId] as const,
};

export type CalendarEventInput = Omit<CalendarEventRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">;
export type CalendarEventPatch = Partial<CalendarEventInput>;

export function useCalendarEvents(tenantId?: string, enabled = true) {
  return useQuery({
    queryKey: tenantId ? calendarKeys.tenant(tenantId) : calendarKeys.all,
    queryFn: () => CalendarAdapter.listEvents(tenantId!),
    enabled: Boolean(tenantId) && enabled,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CalendarEventInput) => CalendarAdapter.createEvent(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: CalendarEventPatch }) => CalendarAdapter.updateEvent(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => CalendarAdapter.deleteEvent(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}
