"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { useStudents } from "@/lib/api/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentAttendance() {
  const [search, setSearch] = useState("");
  const students = useStudents();
  const filteredStudents = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (students.data ?? []).filter((student) =>
      `${student.firstName} ${student.lastName}`.toLocaleLowerCase().includes(term),
    );
  }, [students.data, search]);

  return (
    <PageShell title="Student Attendance" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Students" }]} permission={permissions.attendanceView}>
      {students.isLoading ? <LoadingPage /> : students.isError ? (
        <ErrorState title="Unable to load students" description="Try refreshing the student list." onRetry={() => void students.refetch()} />
      ) : (students.data ?? []).length === 0 ? (
        <EmptyState title="No students available" description="No students are available within your access scope." icon={Users} />
      ) : (
        <div className="space-y-4">
          <label className="relative block max-w-sm">
            <span className="sr-only">Search students</span>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" className="pl-9" />
          </label>
          {filteredStudents.length === 0 ? <EmptyState title="No matching students" description="Try a different student name." /> : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => <li key={student.id} className="flex items-center justify-between gap-3 rounded-md border bg-card p-4">
                <span className="font-medium">{student.firstName} {student.lastName}</span>
                <Button variant="outline" size="sm" asChild><Link href={`/attendance/students/${student.id}`}>View attendance</Link></Button>
              </li>)}
            </ul>
          )}
        </div>
      )}
    </PageShell>
  );
}
