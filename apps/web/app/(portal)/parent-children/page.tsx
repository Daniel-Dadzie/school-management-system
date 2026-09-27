import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentChildrenPage() {
  return (
    <PageShell title="My Children" breadcrumbs={[{ label: "My Children" }]} permission={permissions.parentChildrenView}>
      <div className="space-y-6">
        <EmptyState
          title="No children linked"
          description="No children are currently linked to your account."
          icon={Users}
        />
      </div>
    </PageShell>
  );
}
