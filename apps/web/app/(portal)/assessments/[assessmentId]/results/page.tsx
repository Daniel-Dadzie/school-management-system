"use client";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { FileSpreadsheet } from "lucide-react";

export default function AssessmentResults() {
  const { assessmentId } = useParams();

  return (
    <PageShell title="Page" breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: "Detail", href: `/assessments/${assessmentId}` }, { label: "Results" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Assessment Results</h2>
        
        <EmptyState
          title="No results found"
          description="No results have been entered for this assessment yet."
          icon={<FileSpreadsheet className="w-10 h-10 text-muted-foreground" />}
          action={<Button>Enter Results</Button>}
        />
      </div>
    </PageShell>
  );
}