import { BookMarked } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export default function TeacherClassesPage() {
  return (
    <PageShell title="My Classes" breadcrumbs={[{ label: "My Classes" }]} allowedRoles={["TEACHER"]}>
      <div className="p-4 border rounded shadow-sm text-center py-10 bg-card mt-6">
        <BookMarked className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No classes assigned</h3>
        <p className="text-muted-foreground">You have not been assigned to any classes for the current term.</p>
      </div>
    </PageShell>
  );
}
