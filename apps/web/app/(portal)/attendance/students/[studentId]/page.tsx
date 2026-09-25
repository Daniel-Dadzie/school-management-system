"use client";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { useParams } from "next/navigation";

export default function StudentAttendanceDetail() {
  const { studentId } = useParams();
  // We need a termId to query. We can default to empty and wait for filter
  
  return (
    <PageShell title="Student Attendance Details" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students", href: "/attendance/students" }, { label: "Details" }]} allowedRoles={["SUPER_ADMIN", "ADMIN", "TEACHER"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Attendance</h2>
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