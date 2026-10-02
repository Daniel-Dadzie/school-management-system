/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
import { MockDatabase } from "@/lib/functional/storage/database";
import type { CalendarEventRecord } from "@/lib/functional/types";

function save(events: CalendarEventRecord[]) {
  MockDatabase.setCollection("calendarEvents", events as any);
}

export const CalendarService = {
  list(tenantId: string): CalendarEventRecord[] {
    const all = MockDatabase.getCollection("calendarEvents") as unknown as CalendarEventRecord[];
    return all
      .filter((e) => e.tenantId === tenantId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  create(data: Omit<CalendarEventRecord, "id" | "createdAt" | "updatedAt">): CalendarEventRecord {
    const all = MockDatabase.getCollection("calendarEvents") as unknown as CalendarEventRecord[];
    const now = new Date().toISOString();
    const record: CalendarEventRecord = {
      ...data,
      id: `evt-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    save([...all, record]);
    return record;
  },

  update(id: string, patch: Partial<CalendarEventRecord>): CalendarEventRecord {
    const all = MockDatabase.getCollection("calendarEvents") as unknown as CalendarEventRecord[];
    const updated = all.map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
    );
    save(updated);
    return updated.find((e) => e.id === id)!;
  },

  delete(id: string): void {
    const all = MockDatabase.getCollection("calendarEvents") as unknown as CalendarEventRecord[];
    save(all.filter((e) => e.id !== id));
  },
};
