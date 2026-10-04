import PageShell from "@/components/layout/page-shell";
import { AdmissionDetail } from "./admission-detail";
import { permissions } from "@/lib/authorization/permissions";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdmissionDetailPage(props: PageProps) {
  const params = use(props.params);
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
