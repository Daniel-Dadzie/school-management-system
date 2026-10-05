import { SuperAdminSchools } from "@/components/portal/super-admin/schools";
import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export const metadata = {
  title: "Platform Tenants | Karatu SIS",
  description: "Manage schools and tenants on the platform.",
};

export default function SuperAdminSchoolsPage() {
  return (
    <PageShell
      title="Platform Tenants"
      description="Manage and onboard schools onto the Karatu SIS platform."
      permission={permissions.platformManage}
    >
      <SuperAdminSchools />
    </PageShell>
  );
}
