import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";

export default function ParentNotificationsPage() {
  return (
    <PageShell title="Notifications" breadcrumbs={[{ label: "Notifications" }]} allowedRoles={["PARENT"]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <EmptyState
          title="You're all caught up"
          description="There are no new notifications."
          icon={Bell}
        />
      </div>
    </PageShell>
  );
}
