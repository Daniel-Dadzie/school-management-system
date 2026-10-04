"use client";
import { useAcademicYears } from "@/lib/api/academic";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Calendar } from "lucide-react";
import { CreateYearDialog } from "../create-dialogs";

export default function AcademicYears() {
  const { data: years, isLoading } = useAcademicYears();

  if (isLoading) return <LoadingSpinner />;

  if (!years || years.length === 0) {
    return (
      <EmptyState
        title="No Academic Years"
        description="No academic years have been configured yet."
        icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
        action={<CreateYearDialog />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Academic Years</h2>
        <CreateYearDialog />
      </div>
      <div className="grid gap-4">
        {years.map((y) => (
          <div key={y.id} className="p-4 border rounded shadow-sm">{y.name} - {y.status}</div>
        ))}
      </div>
    </div>
  );
}
