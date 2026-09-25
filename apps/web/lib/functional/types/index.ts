export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';

export interface TenantRecord {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
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

export interface StudentRecord {
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

export interface ClassRecord {
  id: string;
  tenantId: string;
  name: string;
  gradeLevel: string;
  academicYearId: string;
  formTeacherId?: string;
  capacity: number;
}

export interface AuditEventRecord {
  id: string;
  tenantId: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'UPDATE' | 'CREATE' | 'DELETE';
  entityType: string;
  entityId?: string;
  details?: string; // stringified JSON to avoid 'unknown' or 'any' type dictionaries
  ipAddress?: string;
  createdAt: string;
}

export interface AuthSession {
  user: Omit<UserRecord, 'password'>;
  token: string;
}

export interface MockStore {
  version: number;
  tenants: TenantRecord[];
  users: UserRecord[];
  students: StudentRecord[];
  classes: ClassRecord[];
  auditEvents: AuditEventRecord[];
}
