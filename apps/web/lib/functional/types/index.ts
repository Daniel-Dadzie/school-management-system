export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'STUDENT';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  enrollmentId: string;
  currentClassId: string;
  dateOfBirth: string;
  guardianId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
