import PageShell from "@/components/layout/page-shell";
import { UserDetail } from "./user-detail";
import { permissions } from "@/lib/authorization/permissions";

interface PageProps {
  params: { id: string };
}

export default function UserDetailPage({ params }: PageProps) {
  return (
    <PageShell
      title="User Profile"
      breadcrumbs={[
        { label: "Users", href: "/users" },
        { label: "Profile" }
      ]}
      permission={permissions.usersManage}>
      <UserDetail id={params.id} />
    </PageShell>
  );
}
