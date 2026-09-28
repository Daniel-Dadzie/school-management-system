import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";
import { use } from "react";

export default function StudentDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  return (
    <PageShell title="Student Detail" breadcrumbs={[{ label: "Students", href: "/students" }, { label: "Detail" }]} permission={permissions.studentsManage}>
      <p>Student ID: {params.id}</p>
    </PageShell>
  );
}
