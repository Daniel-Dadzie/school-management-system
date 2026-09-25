import PageShell from "@/components/layout/page-shell";
import { UserDetail } from "./user-detail";

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
      allowedRoles={["SUPER_ADMIN"]}
    >
      <UserDetail id={params.id} />
    </PageShell>
  );
}
