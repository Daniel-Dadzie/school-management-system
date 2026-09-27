import { UserCreateRequest, UserResponse } from '../../api/users';
import { UserRepository } from '../repositories/user-repository';
import { MockDatabase } from '../storage/database';
import { UserRecord } from '../types';
import { assertPermission, permissions } from '@/lib/authorization/permissions';

const toResponse = (user: UserRecord): UserResponse => ({
  id: user.id, username: user.username, email: user.email, role: user.role,
  status: user.isActive ? 'ACTIVE' : 'INACTIVE', createdAt: user.createdAt,
  firstName: user.firstName, lastName: user.lastName,
});

export class UserService {
  static list(): UserResponse[] { assertPermission(permissions.usersView); return UserRepository.findAll().map(toResponse); }
  static get(id: string | number): UserResponse | null {
    assertPermission(permissions.usersView);
    const user = UserRepository.findById(String(id));
    return user ? toResponse(user) : null;
  }
  static create(data: UserCreateRequest): UserResponse {
    assertPermission(permissions.usersManage);
    const now = new Date().toISOString();
    const store = MockDatabase.getStore();
    const record: UserRecord = {
      id: `user-${globalThis.crypto.randomUUID()}`, tenantId: store.tenants[0].id,
      username: data.username, email: data.email, firstName: data.firstName ?? '',
      lastName: data.lastName ?? '', role: data.role, isActive: true,
      createdAt: now, updatedAt: now,
    };
    return toResponse(UserRepository.save(record));
  }
}
