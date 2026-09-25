import { Tenant, User, Student, AuditLog } from '../types';

export const defaultTenant: Tenant = {
  id: 'tenant-1',
  name: 'CarePoint Community School',
  subdomain: 'demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultUsers: User[] = [
  {
    id: 'user-superadmin-1',
    tenantId: defaultTenant.id,
    username: 'superadmin',
    email: 'superadmin@carepoint.demo',
    password: 'password',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-1',
    tenantId: defaultTenant.id,
    username: 'admin',
    email: 'admin@carepoint.demo',
    password: 'password',
    firstName: 'School',
    lastName: 'Admin',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-teacher-1',
    tenantId: defaultTenant.id,
    username: 'teacher',
    email: 'teacher@carepoint.demo',
    password: 'password',
    firstName: 'Demo',
    lastName: 'Teacher',
    role: 'TEACHER',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-parent-1',
    tenantId: defaultTenant.id,
    username: 'parent',
    email: 'parent@carepoint.demo',
    password: 'password',
    firstName: 'Demo',
    lastName: 'Parent',
    role: 'PARENT',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const defaultStudents: Student[] = [];
export const defaultAuditLogs: AuditLog[] = [];

export const initialData = {
  tenants: [defaultTenant],
  users: defaultUsers,
  students: defaultStudents,
  auditLogs: defaultAuditLogs,
};
