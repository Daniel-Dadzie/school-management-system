import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FileSpreadsheet } from "lucide-react";

export default function ParentResultsOverview() {
  return (
    <PageShell title="Results" breadcrumbs={[{ label: "Results" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Student Results</h2>
        <EmptyState
          title="No results found"
          description="Assessment results are currently not available."
          icon={FileSpreadsheet}
        />
      </div>
    </PageShell>
  );
}
