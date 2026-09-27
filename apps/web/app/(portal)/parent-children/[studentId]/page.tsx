import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { User } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentChildDetailPage() {
  return (
    <PageShell title="Child Profile" breadcrumbs={[{ label: "My Children", href: "/parent-children" }, { label: "Profile" }]} permission={permissions.parentChildrenView}>
      <div className="space-y-6">
        <EmptyState
          title="Profile not available"
          description="The student profile is currently unavailable."
          icon={User}
        />
      </div>
    </PageShell>
  );
}
