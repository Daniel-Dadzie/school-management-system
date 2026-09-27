import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { FileSpreadsheet } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentResultsOverview() {
  return (
    <PageShell title="Results" breadcrumbs={[{ label: "Results" }]} permission={permissions.parentResultsView}>
      <div className="space-y-6">
        <EmptyState
          title="No results found"
          description="Assessment results are currently not available."
          icon={FileSpreadsheet}
        />
      </div>
    </PageShell>
  );
}
