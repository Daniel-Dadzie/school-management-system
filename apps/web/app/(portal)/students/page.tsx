import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";

export default function StudentsPage() {
  return (
    <PageShell title="Students" breadcrumbs={[{ label: "Students" }]} permission={permissions.studentsManage}>
      <p>Student management</p>
    </PageShell>
  );
}
