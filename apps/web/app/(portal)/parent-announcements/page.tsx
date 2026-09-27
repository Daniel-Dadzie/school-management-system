import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentAnnouncementsPage() {
  return (
    <PageShell title="Announcements" breadcrumbs={[{ label: "Announcements" }]} permission={permissions.announcementsView}>
      <div className="space-y-6">
        <EmptyState
          title="No announcements"
          description="No announcements are available right now."
          icon={Megaphone}
        />
      </div>
    </PageShell>
  );
}
