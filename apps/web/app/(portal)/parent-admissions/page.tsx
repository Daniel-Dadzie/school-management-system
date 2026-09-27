import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ClipboardList } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentAdmissionsPage() {
  return (
    <PageShell title="Admission Applications" breadcrumbs={[{ label: "Admissions" }]} permission={permissions.admissionsOwnView}>
      <div className="space-y-6">
        <EmptyState
          title="No applications found"
          description="No admission applications are associated with your account."
          icon={ClipboardList}
        />
      </div>
    </PageShell>
  );
}
