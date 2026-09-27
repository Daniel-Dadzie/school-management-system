import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentNotificationsPage() {
  return (
    <PageShell title="Notifications" breadcrumbs={[{ label: "Notifications" }]} permission={permissions.notificationsView}>
      <div className="space-y-6">
        <EmptyState
          title="You're all caught up"
          description="There are no new notifications."
          icon={Bell}
        />
      </div>
    </PageShell>
  );
}
