import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { User } from "lucide-react";

export default function ParentChildDetailPage() {
  return (
    <PageShell title="Child Profile" breadcrumbs={[{ label: "My Children", href: "/parent-children" }, { label: "Profile" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Child Profile</h2>
        <EmptyState
          title="Profile not available"
          description="The student profile is currently unavailable."
          icon={User}
        />
      </div>
    </PageShell>
  );
}
