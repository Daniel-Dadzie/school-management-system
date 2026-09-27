import PageShell from "@/components/layout/page-shell";
import { UserForm } from "./user-form";
import { permissions } from "@/lib/authorization/permissions";

export default function NewUserPage() {
  return (
    <PageShell
      title="Create User"
      breadcrumbs={[
        { label: "Users", href: "/users" },
        { label: "New User" }
      ]}
      permission={permissions.usersManage}>
      <div className="max-w-2xl mx-auto space-y-6">
        <UserForm />
      </div>
    </PageShell>
  );
}
