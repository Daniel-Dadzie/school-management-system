import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen } from "lucide-react";

export default function ParentAcademicsPage() {
  return (
    <PageShell title="Academics" breadcrumbs={[{ label: "Academics" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Academics</h2>
        <EmptyState
          title="No Academic Records"
          description="Academic information is currently unavailable."
          icon={BookOpen}
        />
      </div>
    </PageShell>
  );
}
