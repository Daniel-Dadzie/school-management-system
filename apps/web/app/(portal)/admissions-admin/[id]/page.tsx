import PageShell from "@/components/layout/page-shell";
import { AdmissionDetail } from "./admission-detail";
import { permissions } from "@/lib/authorization/permissions";

interface PageProps {
  params: { id: string };
}

export default function AdmissionDetailPage({ params }: PageProps) {
  return (
    <PageShell
      title="Application Details"
      breadcrumbs={[
        { label: "Admissions", href: "/admissions-admin" },
        { label: "Details" }
      ]}
      permission={permissions.admissionsManage}>
      <AdmissionDetail id={params.id} />
    </PageShell>
  );
}
