import PageShell from "@/components/layout/page-shell";
import { UsersTable } from "./users-table";

export default function UsersPage() {
  return (
    <PageShell
      title="User Management"
      breadcrumbs={[{ label: "Users" }]}
    >
      <div className="space-y-6">
        <UsersTable />
      </div>
    </PageShell>
  );
}
