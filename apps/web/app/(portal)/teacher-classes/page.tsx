"use client";

import { BookMarked } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { permissions } from "@/lib/authorization/permissions";
import {
  useSchoolClasses,
  useSubjects,
  useTeacherAssignments,
} from "@/lib/api/academic";

export default function TeacherClassesPage() {
  const assignments = useTeacherAssignments(true);
  const classes = useSchoolClasses();
  const subjects = useSubjects();

  const isLoading = assignments.isLoading || classes.isLoading || subjects.isLoading;
  const isError = assignments.isError || classes.isError || subjects.isError;

  return (
    <PageShell title="My Classes" breadcrumbs={[{ label: "My Classes" }]} permission={permissions.teacherClassesView}>
      {isLoading ? (
        <LoadingPage />
      ) : isError ? (
        <p role="alert" className="rounded-md border border-destructive p-4 text-sm text-destructive">
          Assigned classes could not be loaded. Please try again.
        </p>
      ) : !assignments.data?.length ? (
        <EmptyState
          icon={BookMarked}
          title="No classes assigned"
          description="You have not been assigned to any classes for the current term."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.data.map((assignment) => {
            const schoolClass = classes.data?.find((item) => item.id === assignment.schoolClassId);
            const subject = subjects.data?.find((item) => item.id === assignment.subjectId);
            return (
              <article key={assignment.id} className="rounded-md border bg-card p-5">
                <h2 className="font-semibold">{schoolClass?.name ?? "Class unavailable"}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subject?.name ?? "Subject unavailable"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
