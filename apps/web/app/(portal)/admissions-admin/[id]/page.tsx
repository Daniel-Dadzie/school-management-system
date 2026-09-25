import PageShell from "@/components/layout/page-shell";
import { AdmissionDetail } from "./admission-detail";

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
     allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <AdmissionDetail id={params.id} />
    </PageShell>
  );
}
