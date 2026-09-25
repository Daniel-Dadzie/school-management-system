"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck, History, Users } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/stores/auth-store";

export default function AttendanceOverview() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  if (user.role === "PARENT") {
    return (
      <PageShell title="Attendance" breadcrumbs={[{ label: "Attendance" }]}>
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
    <PageShell title="Attendance" breadcrumbs={[{ label: "Attendance" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/attendance/take">
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <CalendarCheck className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Take Attendance</CardTitle>
                <CardDescription>Record daily attendance for classes.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/attendance/history">
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <History className="w-8 h-8 mb-2 text-primary" />
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>View and filter past attendance records.</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/attendance/students">
            <Card className="hover:bg-accent transition-colors">
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
