import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone } from "lucide-react";

export default function ParentAnnouncementsPage() {
  return (
    <PageShell title="Announcements" breadcrumbs={[{ label: "Announcements" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Announcements</h2>
        <EmptyState
          title="No announcements"
          description="No announcements are available right now."
          icon={Megaphone}
        />
      </div>
    </PageShell>
  );
}
