"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarCheck } from "lucide-react";
import { useStudent } from "@/lib/api/students";
import { useAccessibleTerms } from "@/lib/api/academic";
import { useAttendanceForTerm } from "@/lib/api/attendance";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { LoadingPage } from "@/components/ui/loading";
import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentAttendanceDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const [termId, setTermId] = useState("");
  const student = useStudent(studentId);
  const terms = useAccessibleTerms();
  const availableTerms = useMemo(() => terms.data ?? [], [terms.data]);
  const selectedTermId = availableTerms.some((term) => term.id === termId) ? termId : availableTerms[0]?.id ?? "";
  const attendance = useAttendanceForTerm(selectedTermId);

  if (student.isLoading || terms.isLoading) return <PageShell title="Student Attendance" permission={permissions.attendanceView}><LoadingPage /></PageShell>;
  if (student.isError || terms.isError) return <PageShell title="Student Attendance" permission={permissions.attendanceView}><ErrorState title="Unable to load attendance" description="Try refreshing this student record." onRetry={() => { void student.refetch(); void terms.refetch(); }} /></PageShell>;
  if (!student.data) return <PageShell title="Student Attendance" permission={permissions.attendanceView}><ForbiddenState title="Student access denied" /></PageShell>;

  const records = (attendance.data ?? []).filter((record) => record.studentId === studentId);

  return (
    <PageShell title="Student Attendance" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students", href: "/attendance/students" }, { label: `${student.data.firstName} ${student.data.lastName}` }]} permission={permissions.attendanceView}>
      <div className="space-y-4">
        <label className="grid max-w-sm gap-1 text-sm font-medium">Term
          <select aria-label="Filter by term" value={selectedTermId} onChange={(event) => setTermId(event.target.value)} className="rounded-md border bg-background p-2">
            {availableTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
          </select>
        </label>
        {attendance.isLoading ? <LoadingPage /> : attendance.isError ? (
          <ErrorState title="Unable to load attendance" description="Try refreshing attendance records." onRetry={() => void attendance.refetch()} />
        ) : records.length === 0 ? (
          <EmptyState title="No attendance records" description="No attendance has been recorded for this student in the selected term." icon={CalendarCheck} />
        ) : (
          <ul className="divide-y rounded-md border bg-card">
            {records.map((record) => <li key={record.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <time dateTime={record.attendanceDate}>{record.attendanceDate}</time>
              <span className="font-medium">{record.status}</span>
            </li>)}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
