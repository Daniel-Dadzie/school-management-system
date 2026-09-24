"use client";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import Link from "next/link";

export default function StudentAttendance() {
  return (
    <PageShell title="Page" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Attendance</h2>
        
        <EmptyState
          title="Select a student"
          description="Search for a student to view their attendance."
          icon={<Users className="w-10 h-10 text-muted-foreground" />}
        />
      </div>
    </PageShell>
  );
}