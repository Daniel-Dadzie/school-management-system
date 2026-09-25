import PageShell from "@/components/layout/page-shell";
import { AdmissionsTable } from "./admissions-table";

export default function AdmissionsAdminPage() {
  return (
    <PageShell
      title="Admissions"
      breadcrumbs={[{ label: "Admissions" }]}
     allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <div className="space-y-6">
        <AdmissionsTable />
      </div>
    </PageShell>
  );
}
