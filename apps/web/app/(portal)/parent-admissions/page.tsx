import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList } from "lucide-react";

export default function ParentAdmissionsPage() {
  return (
    <PageShell title="Admission Applications" breadcrumbs={[{ label: "Admissions" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
        <EmptyState
          title="No applications found"
          description="No admission applications are associated with your account."
          icon={ClipboardList}
        />
      </div>
    </PageShell>
  );
}
