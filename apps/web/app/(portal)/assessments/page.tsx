import Link from "next/link";
import { FileSpreadsheet, PlusCircle } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function AssessmentsOverview() {
  return (
    <PageShell title="Assessments" breadcrumbs={[{ label: "Assessments" }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Assessments</h2>
          <Link href="/assessments/new">
             <Button><PlusCircle className="mr-2 h-4 w-4" /> New Assessment</Button>
          </Link>
        </div>
        
        <div className="p-4 border rounded shadow-sm text-center py-10">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No assessments found</h3>
          <p className="text-muted-foreground">Assessments are currently listed as NOT STARTED in the backend development status. Data will appear here once the API is available.</p>
        </div>
      </div>
    </PageShell>
  );
}