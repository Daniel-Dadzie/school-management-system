"use client";

import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import PageShell from "@/components/layout/page-shell";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";
import {
  useAccessibleTerms,
  useSchoolClasses,
  useSubjects,
  useTeacherAssignments,
} from "@/lib/api/academic";

export default function TakeAttendance() {
  const user = useAuthStore((state) => state.user);
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const assignments = useTeacherAssignments(user?.role !== "TEACHER");
  const classes = useSchoolClasses();
  const subjects = useSubjects();
  const terms = useAccessibleTerms();

  const availableTermIds = useMemo(
    () => new Set((assignments.data ?? []).map((assignment) => assignment.termId)),
    [assignments.data],
  );
  const availableTerms = (terms.data ?? []).filter((term) => availableTermIds.has(term.id));
  const selectedTermId = availableTerms.some((term) => term.id === termId)
    ? termId
    : availableTerms[0]?.id ?? "";
  const selectedAssignments = (assignments.data ?? []).filter((assignment) =>
    assignment.termId === selectedTermId,
  );
  const availableClasses = (classes.data ?? []).filter((schoolClass) =>
    selectedAssignments.some((assignment) => assignment.schoolClassId === schoolClass.id),
  );
  const selectedClassId = availableClasses.some((item) => item.id === classId)
    ? classId
    : availableClasses[0]?.id ?? "";
  const availableSubjects = (subjects.data ?? []).filter((subject) =>
    selectedAssignments.some((assignment) =>
      assignment.schoolClassId === selectedClassId && assignment.subjectId === subject.id,
    ),
  );
  const selectedSubjectId = availableSubjects.some((item) => item.id === subjectId)
    ? subjectId
    : availableSubjects[0]?.id ?? "";

  const isLoading = assignments.isLoading || classes.isLoading || subjects.isLoading || terms.isLoading;
  const isError = assignments.isError || classes.isError || subjects.isError || terms.isError;

  return (
    <PageShell title="Take Attendance" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Take Attendance" }]} permission={permissions.attendanceRecord}>
      {isLoading ? <LoadingPage /> : isError ? (
        <p role="alert" className="rounded-md border border-destructive p-4 text-sm text-destructive">
          Attendance selections could not be loaded. Please try again.
        </p>
      ) : availableTerms.length === 0 ? (
        <EmptyState
          title="No assigned classes"
          description="There are no active class assignments available for attendance."
          icon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="space-y-6">
          <section className="rounded-md border bg-card p-4">
            <p className="mb-4 text-sm text-muted-foreground">Select an assigned class, subject, and term to record attendance.</p>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <label className="grid gap-1 text-sm font-medium">
                Date
                <input aria-label="Attendance date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-md border bg-background p-2" />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Term
                <select aria-label="Term" value={selectedTermId} onChange={(event) => setTermId(event.target.value)} className="rounded-md border bg-background p-2">
                  {availableTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Class
                <select aria-label="Class" value={selectedClassId} onChange={(event) => setClassId(event.target.value)} className="rounded-md border bg-background p-2">
                  {availableClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Subject
                <select aria-label="Subject" value={selectedSubjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-md border bg-background p-2">
                  {availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
            </div>
            <Button disabled={!selectedTermId || !selectedClassId || !selectedSubjectId || !date}>Load Students</Button>
          </section>

          <EmptyState
            title="No students loaded"
            description="Select the assigned class, subject, and term to begin."
            icon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />}
          />
        </div>
      )}
    </PageShell>
  );
}
