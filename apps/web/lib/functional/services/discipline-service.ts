/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
import { MockDatabase } from "@/lib/functional/storage/database";
import type { IncidentRecord } from "@/lib/functional/types";

function save(incidents: IncidentRecord[]) {
  MockDatabase.setCollection("incidents", incidents as any);
}

export const DisciplineService = {
  list(tenantId: string): IncidentRecord[] {
    const all = MockDatabase.getCollection("incidents") as unknown as IncidentRecord[];
    return all.filter((i) => i.tenantId === tenantId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): IncidentRecord | undefined {
    const all = MockDatabase.getCollection("incidents") as unknown as IncidentRecord[];
    return all.find((i) => i.id === id);
  },

  create(data: Omit<IncidentRecord, "id" | "createdAt" | "updatedAt">): IncidentRecord {
    const all = MockDatabase.getCollection("incidents") as unknown as IncidentRecord[];
    const now = new Date().toISOString();
    const record: IncidentRecord = {
      ...data,
      id: `inc-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    save([...all, record]);
    return record;
  },

  update(id: string, patch: Partial<IncidentRecord>): IncidentRecord {
    const all = MockDatabase.getCollection("incidents") as unknown as IncidentRecord[];
    const updated = all.map((i) =>
      i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i
    );
    save(updated);
    return updated.find((i) => i.id === id)!;
  },

  delete(id: string): void {
    const all = MockDatabase.getCollection("incidents") as unknown as IncidentRecord[];
    save(all.filter((i) => i.id !== id));
  },
};
