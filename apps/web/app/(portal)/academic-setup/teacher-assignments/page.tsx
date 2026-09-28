"use client";

import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useAcademicTeacherOptions, useSchoolClasses, useSubjects, useTeacherAssignments, useUpdateTeacherAssignmentStatus, useAccessibleTerms } from "@/lib/api/academic";
import { CreateAssignmentDialog } from "../create-dialogs";
import { toast } from "sonner";

export default function TeacherAssignments() {
  const assignments = useTeacherAssignments();
  const teachers = useAcademicTeacherOptions();
  const classes = useSchoolClasses();
  const subjects = useSubjects();
  const terms = useAccessibleTerms();
  const updateStatus = useUpdateTeacherAssignmentStatus();

  const isLoading = assignments.isLoading || classes.isLoading || subjects.isLoading || terms.isLoading;
  const isError = assignments.isError || classes.isError || subjects.isError || terms.isError;

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return <p role="alert">Unable to load teacher assignments.</p>;
  }

  if (!assignments.data || assignments.data.length === 0) {
    return (
      <EmptyState
        title="No Assignments"
        description="No teacher assignments have been made."
        icon={<GraduationCap className="w-10 h-10 text-muted-foreground" />}
        action={<CreateAssignmentDialog />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Teacher Assignments</h2>
        <CreateAssignmentDialog />
      </div>
      <div className="grid gap-4">
        {assignments.data.map((assignment) => (
          <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-card p-4">
            <div>
              <h3 className="font-semibold">
                {classes.data?.find((item) => item.id === assignment.schoolClassId)?.name ?? "Class unavailable"}
                <span className="font-normal text-muted-foreground"> · {subjects.data?.find((item) => item.id === assignment.subjectId)?.name ?? "Subject unavailable"}</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                {teachers.data?.find((item) => item.id === assignment.teacherId)?.displayName ?? (teachers.isError ? "Teacher details unavailable in API mode" : "Teacher details unavailable")}
                {" · "}{terms.data?.find((item) => item.id === assignment.termId)?.name ?? "Term unavailable"}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate(
                { id: assignment.id, status: assignment.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
                { onSuccess: () => toast.success("Assignment status updated."), onError: () => toast.error("Unable to update assignment status.") },
              )}
            >
              {assignment.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
