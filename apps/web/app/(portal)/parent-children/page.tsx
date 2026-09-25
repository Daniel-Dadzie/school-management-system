import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

export default function ParentChildrenPage() {
  return (
    <PageShell title="My Children" breadcrumbs={[{ label: "My Children" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">My Children</h2>
        <EmptyState
          title="No children linked"
          description="No children are currently linked to your account."
          icon={Users}
        />
      </div>
    </PageShell>
  );
}
