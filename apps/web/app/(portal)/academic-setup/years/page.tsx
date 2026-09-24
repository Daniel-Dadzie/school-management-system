"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AcademicYears() {
  const { data: years, isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => apiClient<any[]>("/academic-years"),
  });

  if (isLoading) return <LoadingSpinner />;

  if (!years || years.length === 0) {
    return (
      <EmptyState
        title="No Academic Years"
        description="No academic years have been configured yet."
        icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
        action={<Button>Add Academic Year</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Academic Years</h2>
      <div className="grid gap-4">
        {years.map(y => (
          <div key={y.id} className="p-4 border rounded shadow-sm">{y.name} - {y.status}</div>
        ))}
      </div>
    </div>
  );
}