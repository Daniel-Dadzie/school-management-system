import { assertPermission, AuthorizationError, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { ParentRepository } from '../repositories/parent-repository';
import { StudentRecord } from '../types';

export class ParentService {
  static getChildrenForParent(parentUserId: string): StudentRecord[] {
    assertPermission(permissions.parentChildrenView);

    const user = useAuthStore.getState().user;
    if (user?.role !== 'PARENT' || user.id !== parentUserId || !user.tenantId) {
      throw new AuthorizationError();
    }

    return ParentRepository.findChildrenForParent(user.id, user.tenantId);
  }
}
