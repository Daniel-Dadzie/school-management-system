"use client";

import { useAuthStore } from "@/stores/auth-store";
import PageShell from "@/components/layout/page-shell";
import { AdminDashboard } from "@/components/portal/dashboards/admin-dashboard";
import { SuperAdminDashboard } from "@/components/portal/dashboards/super-admin-dashboard";
import { TeacherDashboard } from "@/components/portal/dashboards/teacher-dashboard";
import { ParentDashboard } from "@/components/portal/dashboards/parent-dashboard";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const isAdmin = user.role === "ADMIN";
  const isTeacher = user.role === "TEACHER";
  const isParent = user.role === "PARENT";

  return (
    <PageShell
      title="Dashboard"
      description="Welcome to your CarePoint portal."
    >
      {isSuperAdmin && <SuperAdminDashboard />}
      {isAdmin && <AdminDashboard />}
      {isTeacher && <TeacherDashboard />}
      {isParent && <ParentDashboard />}
    </PageShell>
  );
}
