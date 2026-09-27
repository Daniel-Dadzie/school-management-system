import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { UserCircle } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentProfilePage() {
  return (
    <PageShell title="My Profile" breadcrumbs={[{ label: "Profile" }]} permission={permissions.profileView}>
      <div className="space-y-6">
        <EmptyState
          title="Profile unavailable"
          description="Your profile information could not be loaded."
          icon={UserCircle}
        />
      </div>
    </PageShell>
  );
}
