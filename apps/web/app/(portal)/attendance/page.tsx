"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, History, Users } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission, permissions } from "@/lib/authorization/permissions";

export default function AttendanceOverview() {
  const user = useAuthStore((state) => state.user);
  const canRecordAttendance = hasPermission(user?.role, permissions.attendanceRecord);

  if (!user) return null;

  if (user.role === "PARENT") {
    return (
      <PageShell title="Attendance" breadcrumbs={[{ label: "Attendance" }]} permission={permissions.attendanceView}>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Student Attendance</h2>
          <EmptyState
            title="Attendance Not Available"
            description="The attendance system is currently unavailable or you have no children linked to your account."
            icon={CalendarCheck}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Attendance" breadcrumbs={[{ label: "Attendance" }]} permission={permissions.attendanceView}>
      <div className="space-y-6">
        <div className="grid auto-rows-fr items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {canRecordAttendance && <Link href="/attendance/take" className="block h-full">
            <Card className="h-full min-h-48 transition-colors hover:border-primary">
              <CardHeader>
                <CalendarCheck className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>Record daily attendance for classes.</CardDescription>
              </CardHeader>
            </Card>
          </Link>}
          <Link href="/attendance/history" className="block h-full">
            <Card className="h-full min-h-48 transition-colors hover:border-primary">
              <CardHeader>
                <History className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>View and filter past attendance records.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/attendance/students" className="block h-full">
            <Card className="h-full min-h-48 transition-colors hover:border-primary">
              <CardHeader>
                <Users className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>View detailed attendance for individual students.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
