import type { Role } from "@/lib/functional/types";
import { useAuthStore } from "@/stores/auth-store";

export const permissions = {
  dashboardView: "dashboard.view",
  teacherClassesView: "teacher-classes.view",
  usersView: "users.view",
  usersManage: "users.manage",
  studentsView: "students.view",
  studentsManage: "students.manage",
  enrollmentsView: "enrollments.view",
  enrollmentsManage: "enrollments.manage",
  promotionsManage: "promotions.manage",
  financeView: "finance.view",
  financeManage: "finance.manage",
  parentFeesView: "parent.fees.view",
  admissionsView: "admissions.view",
  admissionsManage: "admissions.manage",
  admissionsOwnView: "admissions.own.view",
  parentChildrenView: "parent.children.view",
  parentAcademicsView: "parent.academics.view",
  parentResultsView: "parent.results.view",
  academicsView: "academics.view",
  academicsManage: "academics.manage",
  attendanceView: "attendance.view",
  attendanceManage: "attendance.manage",
  attendanceRecord: "attendance.record",
  assessmentsView: "assessments.view",
  assessmentsManage: "assessments.manage",
  assessmentResultsView: "assessments.results.view",
  resultsView: "results.view",
  resultsManage: "results.manage",
  announcementsView: "announcements.view",
  notificationsView: "notifications.view",
  profileView: "profile.view",
  systemManage: "system.manage",
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

const rolePermissions: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: [
      permissions.dashboardView,
      permissions.profileView,
      permissions.usersView,
      permissions.usersManage,
      permissions.studentsView,
      permissions.studentsManage,
      permissions.enrollmentsView,
      permissions.enrollmentsManage,
      permissions.financeView,
      permissions.financeManage,
      permissions.admissionsView,
      permissions.admissionsManage,
      permissions.systemManage,
    ],
  ADMIN: [
    permissions.dashboardView,
    permissions.profileView,
    permissions.usersView,
    permissions.usersManage,
    permissions.studentsView,
    permissions.studentsManage,
    permissions.enrollmentsView,
    permissions.enrollmentsManage,
    permissions.financeView,
    permissions.financeManage,
    permissions.admissionsView,
    permissions.admissionsManage,
    permissions.academicsView,
    permissions.academicsManage,
    permissions.attendanceView,
    permissions.attendanceManage,
    permissions.attendanceRecord,
    permissions.assessmentsView,
    permissions.assessmentsManage,
    permissions.assessmentResultsView,
    permissions.resultsView,
    permissions.resultsManage,
  ],
  TEACHER: [
    permissions.dashboardView,
    permissions.profileView,
    permissions.teacherClassesView,
    permissions.studentsView,
    permissions.enrollmentsView,
    permissions.academicsView,
    permissions.attendanceView,
    permissions.attendanceRecord,
    permissions.assessmentsView,
    permissions.assessmentResultsView,
    permissions.resultsView,
    permissions.resultsManage,
  ],
  PARENT: [
    permissions.dashboardView,
    permissions.studentsView,
    permissions.enrollmentsView,
    permissions.admissionsOwnView,
    permissions.parentChildrenView,
    permissions.parentAcademicsView,
    permissions.parentResultsView,
    permissions.parentFeesView,
    permissions.academicsView,
    permissions.attendanceView,
    permissions.resultsView,
    permissions.announcementsView,
    permissions.notificationsView,
    permissions.profileView,
  ],
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  return role !== undefined && role !== null &&
    Object.prototype.hasOwnProperty.call(rolePermissions, role) &&
    rolePermissions[role as Role].includes(permission);
}

export class AuthorizationError extends Error {
  constructor() {
    super("You do not have permission to perform this action.");
    this.name = "AuthorizationError";
  }
}

export function assertPermission(permission: Permission): void {
  const role = useAuthStore.getState().user?.role;
  if (!hasPermission(role, permission)) throw new AuthorizationError();
}
