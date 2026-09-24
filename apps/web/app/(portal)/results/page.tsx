import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FileSpreadsheet } from "lucide-react";

export default function ParentResultsOverview() {
  return (
    <PageShell title="Page" breadcrumbs={[{ label: "Results" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Results</h2>
        
        <EmptyState
          title="No results found"
          description="Assessment results are currently not available."
          icon={<FileSpreadsheet className="w-10 h-10 text-muted-foreground" />}
        />
      </div>
    </PageShell>
  );
}