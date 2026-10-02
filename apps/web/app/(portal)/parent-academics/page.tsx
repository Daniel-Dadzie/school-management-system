import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentAcademicsPage() {
  return (
    <PageShell title="Academics" breadcrumbs={[{ label: "Academics" }]} permission={permissions.parentAcademicsView}>
      <div className="space-y-6">
        <EmptyState
          title="No Academic Records"
          description="Academic information is currently unavailable."
          icon={BookOpen}
        />
      </div>
    </PageShell>
  );
}
