import { isMockMode } from '../config';
import { AuditService, type AuditFilters } from '../services/audit-service';

export class AuditAdapter {
  static getEvents(filters?: AuditFilters) {
    return isMockMode
      ? Promise.resolve(AuditService.list(filters))
      : Promise.reject(new Error('Audit log API integration is not available yet.'));
  }
}
