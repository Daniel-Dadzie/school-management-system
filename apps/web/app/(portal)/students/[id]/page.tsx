import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageShell title="Student Detail" breadcrumbs={[{ label: "Students", href: "/students" }, { label: "Detail" }]} permission={permissions.studentsManage}>
      <p>Student ID: {params.id}</p>
    </PageShell>
  );
}
