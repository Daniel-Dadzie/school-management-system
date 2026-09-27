import { AuditEventRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class AuditRepository {
  static create(event: Omit<AuditEventRecord, 'id' | 'createdAt'>): AuditEventRecord {
    const store = MockDatabase.getStore();
    const events = store.auditEvents;
    const newEvent: AuditEventRecord = {
      ...event,
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    store.auditEvents = events;
    MockDatabase.saveStore(store);
    return newEvent;
  }

  static findByTenant(tenantId: string): AuditEventRecord[] {
    return MockDatabase.getStore().auditEvents.filter(e => e.tenantId === tenantId);
  }
}
