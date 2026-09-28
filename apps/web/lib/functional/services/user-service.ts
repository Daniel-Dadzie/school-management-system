import { UserCreateRequest, UserResponse, UserUpdateRequest } from '../../api/users';
import { UserRepository } from '../repositories/user-repository';
import { UserRecord, AuditEventRecord } from '../types';
import { assertPermission, permissions, AuthorizationError } from '@/lib/authorization/permissions';
import { AuditRepository } from '../repositories/audit-repository';
import { useAuthStore } from '@/stores/auth-store';
import { TeacherProfileRepository } from '../repositories/teacher-profile-repository';

const toResponse = (user: UserRecord): UserResponse => ({
  id: user.id, username: user.username, email: user.email, role: user.role,
  status: user.isActive ? 'ACTIVE' : 'INACTIVE', createdAt: user.createdAt,
  firstName: user.firstName, lastName: user.lastName,
  middleName: user.middleName, preferredName: user.preferredName, gender: user.gender,
  dateOfBirth: user.dateOfBirth, phone: user.phone, address: user.address,
  lastLoginAt: user.lastLoginAt,
  teacherProfile: TeacherProfileRepository.findByUserId(user.id),
});

export class UserService {
  static activity(id: string): AuditEventRecord[] {
    assertPermission(permissions.usersView);
    const actor = useAuthStore.getState().user;
    const target = UserRepository.findById(id);
    if (!actor?.tenantId || !target || target.tenantId !== actor.tenantId) throw new AuthorizationError();
    return AuditRepository.findByTenant(actor.tenantId).filter((event) => event.userId === id || event.entityId === id);
  }

  static myProfile(): UserResponse {
    assertPermission(permissions.profileView);
    const actor = useAuthStore.getState().user;
    const user = actor ? UserRepository.findById(actor.id) : undefined;
    if (!user || user.tenantId !== actor?.tenantId) throw new AuthorizationError();
    return toResponse(user);
  }

  static updateMyProfile(data: Pick<UserUpdateRequest, 'firstName' | 'middleName' | 'lastName' | 'preferredName' | 'gender' | 'dateOfBirth' | 'phone' | 'address'>): UserResponse {
    assertPermission(permissions.profileView);
    const actor = useAuthStore.getState().user;
    const user = actor ? UserRepository.findById(actor.id) : undefined;
    if (!user || user.tenantId !== actor?.tenantId || !actor) throw new AuthorizationError();
    const updated = { ...user, ...data, role: user.role, tenantId: user.tenantId, updatedAt: new Date().toISOString() };
    UserRepository.save(updated);
    AuditRepository.create({ tenantId: user.tenantId, userId: user.id, action: 'UPDATE', entityType: 'USER_PROFILE', entityId: user.id });
    return toResponse(updated);
  }

  static list(): UserResponse[] {
    assertPermission(permissions.usersView);
    const tenantId = useAuthStore.getState().user?.tenantId;
    return UserRepository.findAll().filter((user) => user.tenantId === tenantId).map(toResponse);
  }
  static get(id: string | number): UserResponse | null {
    assertPermission(permissions.usersView);
    const user = UserRepository.findById(String(id));
    return user && user.tenantId === useAuthStore.getState().user?.tenantId ? toResponse(user) : null;
  }
  static create(data: UserCreateRequest): UserResponse {
    assertPermission(permissions.usersManage);
    const actor = useAuthStore.getState().user;
    if (!actor?.tenantId) throw new AuthorizationError();
    if (actor?.role === 'ADMIN' && (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN')) throw new AuthorizationError();
    if (UserRepository.findAll().some((user) => user.tenantId === actor.tenantId && (user.username.toLowerCase() === data.username.trim().toLowerCase() || user.email.toLowerCase() === data.email.trim().toLowerCase()))) throw new Error('Username or email already exists');
    const now = new Date().toISOString();
    const record: UserRecord = {
      id: `user-${globalThis.crypto.randomUUID()}`, tenantId: actor.tenantId,
      username: data.username.trim(), email: data.email.trim().toLowerCase(), firstName: data.firstName?.trim() ?? '',
      lastName: data.lastName ?? '', middleName: data.middleName, preferredName: data.preferredName,
      gender: data.gender, dateOfBirth: data.dateOfBirth, phone: data.phone, address: data.address,
      role: data.role, isActive: true,
      createdAt: now, updatedAt: now,
    };
    UserRepository.save(record);
    if (data.role === 'TEACHER' && data.teacherProfile) {
      TeacherProfileRepository.save({ ...data.teacherProfile, id: `teacher-profile-${globalThis.crypto.randomUUID()}`, tenantId: record.tenantId, userId: record.id, createdAt: now, updatedAt: now });
    }
    AuditRepository.create({ tenantId: record.tenantId, userId: actor?.id ?? record.id, action: 'CREATE', entityType: 'USER', entityId: record.id });
    return toResponse(record);
  }

  static update(id: string, data: UserUpdateRequest): UserResponse {
    assertPermission(permissions.usersManage);
    const actor = useAuthStore.getState().user;
    const existing = UserRepository.findById(id);
    if (!existing || existing.tenantId !== actor?.tenantId) throw new Error('User not found');
    if (data.role && actor.id === id && data.role !== existing.role) throw new AuthorizationError();
    if (actor?.role === 'ADMIN' && data.role && (data.role === 'ADMIN' || data.role === 'SUPER_ADMIN')) throw new AuthorizationError();
    if (data.username && UserRepository.findAll().some((item) => item.id !== id && item.username.toLowerCase() === data.username?.toLowerCase())) throw new Error('Username already exists');
    if (data.email && UserRepository.findAll().some((item) => item.id !== id && item.email.toLowerCase() === data.email?.toLowerCase())) throw new Error('Email already exists');
    const { teacherProfile, ...userFields } = data;
    const updated: UserRecord = { ...existing, ...userFields, updatedAt: new Date().toISOString() };
    UserRepository.save(updated);
    const profileInput = teacherProfile;
    if (profileInput && updated.role === 'TEACHER') {
      const profile = TeacherProfileRepository.findByUserId(id);
      TeacherProfileRepository.save({ ...profile, ...profileInput, id: profile?.id ?? `teacher-profile-${globalThis.crypto.randomUUID()}`, tenantId: updated.tenantId, userId: id, createdAt: profile?.createdAt ?? updated.updatedAt, updatedAt: updated.updatedAt });
    }
    AuditRepository.create({ tenantId: updated.tenantId, userId: actor.id, action: 'UPDATE', entityType: 'USER', entityId: id, details: JSON.stringify({ roleChanged: Boolean(data.role && data.role !== existing.role) }) });
    return toResponse(updated);
  }

  static setActive(id: string, isActive: boolean): UserResponse {
    assertPermission(permissions.usersManage);
    const actor = useAuthStore.getState().user;
    const existing = UserRepository.findById(id);
    if (!existing || existing.tenantId !== actor?.tenantId) throw new Error('User not found');
    if (actor.id === id) throw new AuthorizationError();
    const updated = { ...existing, isActive, updatedAt: new Date().toISOString() };
    UserRepository.save(updated);
    AuditRepository.create({ tenantId: updated.tenantId, userId: actor.id, action: 'UPDATE', entityType: 'USER', entityId: id, details: JSON.stringify({ isActive }) });
    return toResponse(updated);
  }
}
