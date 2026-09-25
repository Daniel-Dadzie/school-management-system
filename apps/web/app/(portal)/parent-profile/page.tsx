import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { UserCircle } from "lucide-react";

export default function ParentProfilePage() {
  return (
    <PageShell title="My Profile" breadcrumbs={[{ label: "Profile" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <EmptyState
          title="Profile unavailable"
          description="Your profile information could not be loaded."
          icon={UserCircle}
        />
      </div>
    </PageShell>
  );
}
