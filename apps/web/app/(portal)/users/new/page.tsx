import PageShell from "@/components/layout/page-shell";
import { UserForm } from "./user-form";

export default function NewUserPage() {
  return (
    <PageShell
      title="Create User"
      breadcrumbs={[
        { label: "Users", href: "/users" },
        { label: "New User" }
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <UserForm />
      </div>
    </PageShell>
  );
}
