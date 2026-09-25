import { AuditEventRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class AuditRepository {
  static create(event: Omit<AuditEventRecord, 'id' | 'createdAt'>): AuditEventRecord {
    const events = MockDatabase.getCollection('auditEvents');
    const newEvent: AuditEventRecord = {
      ...event,
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    events.push(newEvent);
    MockDatabase.setCollection('auditEvents', events);
    return newEvent;
  }

  static findByTenant(tenantId: string): AuditEventRecord[] {
    return MockDatabase.getCollection('auditEvents').filter(e => e.tenantId === tenantId);
  }
}
