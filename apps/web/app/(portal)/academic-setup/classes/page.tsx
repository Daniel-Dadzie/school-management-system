/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Classes() {
  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => apiClient<any[]>("/classes"),
  });

  if (isLoading) return <LoadingSpinner />;

  if (!classes || classes.length === 0) {
    return (
      <EmptyState
        title="No Classes"
        description="No classes have been configured."
        icon={<Users className="w-10 h-10 text-muted-foreground" />}
        action={<Button>Add Class</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Classes</h2>
      <div className="grid gap-4">
        {classes.map(c => (
          <div key={c.id} className="p-4 border rounded shadow-sm">{c.name} (Capacity: {c.capacity})</div>
        ))}
      </div>
    </div>
  );
}