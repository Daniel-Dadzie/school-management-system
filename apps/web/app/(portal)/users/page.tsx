import PageShell from "@/components/layout/page-shell";
import { UsersTable } from "./users-table";
import { permissions } from "@/lib/authorization/permissions";

export default function UsersPage() {
  return (
    <PageShell
      title="User Management"
      breadcrumbs={[{ label: "Users" }]}
      permission={permissions.usersManage}>
      <div className="space-y-6">
        <UsersTable />
      </div>
    </PageShell>
  );
}
