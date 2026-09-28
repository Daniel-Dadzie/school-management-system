"use client";

import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { useTeacherAssignments } from "@/lib/api/academic";

export default function TeacherAssignments() {
  const { data: assignments, isLoading, isError } = useTeacherAssignments();

  if (isLoading) return <LoadingSpinner />;

  if (isError) {
    return <p role="alert">Unable to load teacher assignments.</p>;
  }

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        title="No Assignments"
        description="No teacher assignments have been made."
        icon={<GraduationCap className="w-10 h-10 text-muted-foreground" />}
        action={<Button>Add Assignment</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Teacher Assignments</h2>
      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="p-4 border rounded shadow-sm">
            Teacher: {assignment.teacherId} | Class: {assignment.schoolClassId}
          </div>
        ))}
      </div>
    </div>
  );
}
