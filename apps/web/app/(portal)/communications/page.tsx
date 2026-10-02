import PageShell from "@/components/layout/page-shell";
import { Inbox } from "@/components/communications/inbox";
import { permissions } from "@/lib/authorization/permissions";

export default function CommunicationsPage() {
  return (
    <PageShell 
      title="Communications" 
      description="Message parents, teachers, and school administrators."
      breadcrumbs={[{ label: "Communications" }]}
      permission={permissions.dashboardView}
    >
      <div className="pt-2">
        <Inbox />
      </div>
    </PageShell>
  );
}