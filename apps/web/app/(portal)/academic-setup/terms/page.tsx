"use client";
import { useAcademicYears, useTerms } from "@/lib/api/academic";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Calendar } from "lucide-react";
import { CreateTermDialog } from "../create-dialogs";

export default function Terms() {
  const { data: years } = useAcademicYears();
  const { data: terms, isLoading } = useTerms(years?.[0]?.id);

  if (isLoading) return <LoadingSpinner />;

  if (!terms || terms.length === 0) {
    return (
      <EmptyState
        title="No Terms"
        description="No terms have been configured."
        icon={<Calendar className="w-10 h-10 text-muted-foreground" />}
        action={<CreateTermDialog />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Terms</h2>
        <CreateTermDialog />
      </div>
      <div className="grid gap-4">
        {terms.map((t) => (
          <div key={t.id} className="p-4 border rounded shadow-sm">{t.name}</div>
        ))}
      </div>
    </div>
  );
}
