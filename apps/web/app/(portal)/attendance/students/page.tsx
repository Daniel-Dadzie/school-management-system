"use client";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentAttendance() {
  return (
    <PageShell title="Student Attendance" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students" }]} permission={permissions.attendanceView}>
      <div className="space-y-6">
        
        <EmptyState
          title="Select a student"
          description="Search for a student to view their attendance."
          icon={<Users className="w-10 h-10 text-muted-foreground" />}
        />
      </div>
    </PageShell>
  );
}
