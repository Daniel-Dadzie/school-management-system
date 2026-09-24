import PageShell from "@/components/layout/page-shell";

export default function StudentsPage() {
  return (
    <PageShell title="Students" breadcrumbs={[{ label: "Students" }]}>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Students</h2>
      <p>Student management</p>
    </PageShell>
  );
}