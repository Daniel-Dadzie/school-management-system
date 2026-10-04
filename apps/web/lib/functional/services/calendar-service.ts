import { assertPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { MockDatabase } from "@/lib/functional/storage/database";
import type { CalendarEventRecord } from "@/lib/functional/types";

type CalendarEventInput = Omit<CalendarEventRecord, "id" | "createdAt" | "updatedAt" | "tenantId" | "createdBy">;
type CalendarEventPatch = Partial<CalendarEventInput>;

const getEvents = (): CalendarEventRecord[] =>
  MockDatabase.getCollection("calendarEvents");

const getActor = () => {
  const actor = useAuthStore.getState().user;
  if (!actor?.tenantId) throw new Error("Your session is not available. Sign in again.");
  return actor;
};

function validateEvent(event: Pick<CalendarEventRecord, "title" | "startDate" | "endDate">) {
  if (!event.title.trim()) throw new Error("Add an event title.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(event.endDate)) {
    throw new Error("Choose valid event dates.");
  }
  if ([event.startDate, event.endDate].some((value) => {
    const timestamp = Date.parse(`${value}T00:00:00.000Z`);
    return !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value;
  })) {
    throw new Error("Choose valid event dates.");
  }
  if (event.endDate < event.startDate) throw new Error("The end date must be on or after the start date.");
}

export const CalendarService = {
  list(tenantId: string): CalendarEventRecord[] {
    assertPermission(permissions.dashboardView);
    const actor = getActor();
    if (tenantId !== actor.tenantId) return [];
    return getEvents()
      .filter((event) => event.tenantId === tenantId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
  },

  create(input: CalendarEventInput): CalendarEventRecord {
    assertPermission(permissions.academicsManage);
    const actor = getActor();
    const event = { ...input, title: input.title.trim() };
    validateEvent(event);
    const now = new Date().toISOString();
    const record: CalendarEventRecord = {
      ...event,
      id: `evt-${globalThis.crypto.randomUUID()}`,
      tenantId: actor.tenantId!,
      createdBy: actor.id,
      createdAt: now,
      updatedAt: now,
    };
    MockDatabase.setCollection("calendarEvents", [...getEvents(), record]);
    return record;
  },

  update(id: string, patch: CalendarEventPatch): CalendarEventRecord {
    assertPermission(permissions.academicsManage);
    const actor = getActor();
    const all = getEvents();
    const current = all.find((event) => event.id === id && event.tenantId === actor.tenantId);
    if (!current) throw new Error("Calendar event not found.");
    const updated = { ...current, ...patch, title: (patch.title ?? current.title).trim() };
    validateEvent(updated);
    const record = { ...updated, updatedAt: new Date().toISOString() };
    MockDatabase.setCollection("calendarEvents", all.map((event) => event.id === id ? record : event));
    return record;
  },

  delete(id: string): void {
    assertPermission(permissions.academicsManage);
    const actor = getActor();
    const all = getEvents();
    if (!all.some((event) => event.id === id && event.tenantId === actor.tenantId)) {
      throw new Error("Calendar event not found.");
    }
    MockDatabase.setCollection("calendarEvents", all.filter((event) => event.id !== id));
  },
};
