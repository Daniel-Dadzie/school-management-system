import PageShell from "@/components/layout/page-shell";
import { AdmissionsTable } from "./admissions-table";
import { permissions } from "@/lib/authorization/permissions";

export default function AdmissionsAdminPage() {
  return (
    <PageShell
      title="Admissions"
      breadcrumbs={[{ label: "Admissions" }]}
      permission={permissions.admissionsManage}>
      <div className="space-y-6">
        <AdmissionsTable />
      </div>
    </PageShell>
  );
}
