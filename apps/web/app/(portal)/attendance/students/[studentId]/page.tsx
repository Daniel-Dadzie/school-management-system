"use client";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { useParams } from "next/navigation";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentAttendanceDetail() {
  const { studentId } = useParams();
  // We need a termId to query. We can default to empty and wait for filter
  
  return (
    <PageShell title="Student Attendance Details" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students", href: "/attendance/students" }, { label: "Details" }]} permission={permissions.attendanceView}>
      <div className="space-y-6">
        <p className="text-muted-foreground">Student ID: {studentId}</p>

        <EmptyState
          title="No records"
          description="Please select a term to view attendance records."
          icon={<CalendarCheck className="w-10 h-10 text-muted-foreground" />}
        />
      </div>
    </PageShell>
  );
}
