"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeacherAssignments() {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: async () => apiClient<any[]>("/teacher-assignments"),
  });

  if (isLoading) return <LoadingSpinner />;

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
        {assignments.map(a => (
          <div key={a.id} className="p-4 border rounded shadow-sm">Teacher: {a.teacherId} | Class: {a.classId}</div>
        ))}
      </div>
    </div>
  );
}