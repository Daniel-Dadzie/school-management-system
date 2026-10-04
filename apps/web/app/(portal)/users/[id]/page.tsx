import PageShell from "@/components/layout/page-shell";
import { UserDetail } from "./user-detail";
import { permissions } from "@/lib/authorization/permissions";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage(props: PageProps) {
  const params = use(props.params);
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
