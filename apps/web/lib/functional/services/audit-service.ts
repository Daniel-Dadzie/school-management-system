import { assertPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { AuditRepository } from '../repositories/audit-repository';
import { UserRepository } from '../repositories/user-repository';
import type { AuditEventRecord } from '../types';

export interface AuditEventView extends AuditEventRecord {
  userName: string;
}

export interface AuditFilters {
  search?: string;
  action?: AuditEventRecord['action'] | 'ALL';
  entityType?: string;
}

export class AuditService {
  static list(filters: AuditFilters = {}): AuditEventView[] {
    assertPermission(permissions.systemManage);
    const tenantId = useAuthStore.getState().user?.tenantId;
    if (!tenantId) return [];

    const search = filters.search?.trim().toLowerCase() ?? '';
    return AuditRepository.findByTenant(tenantId)
      .map((event) => ({
        ...event,
        userName: (() => {
          const user = UserRepository.findById(event.userId);
          return user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'Unknown user';
        })(),
      }))
      .filter((event) => filters.action === undefined || filters.action === 'ALL' || event.action === filters.action)
      .filter((event) => !filters.entityType || event.entityType === filters.entityType)
      .filter((event) => !search || `${event.userName} ${event.entityType} ${event.action} ${event.details ?? ''}`.toLowerCase().includes(search))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
}
