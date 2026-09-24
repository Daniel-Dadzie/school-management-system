import PageShell from "@/components/layout/page-shell";

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  return (
    <PageShell title="Student Detail" breadcrumbs={[{ label: "Students", href: "/students" }, { label: "Detail" }]}>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Student Detail</h2>
      <p>Student ID: {params.id}</p>
    </PageShell>
  );
}