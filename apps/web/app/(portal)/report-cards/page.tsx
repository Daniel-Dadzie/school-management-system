import PageShell from "@/components/layout/page-shell";
import { StudentResultsList } from "@/components/assessments/student-results-list";
import { permissions } from "@/lib/authorization/permissions";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Link from "next/link";
export default function ReportCardsOverview() { return <PageShell title="Report cards" description="Preview a student's term report card and print it from the browser." breadcrumbs={[{ label: "Report cards" }]} permission={permissions.resultsView}>  <div className="mb-4">
    <Link href="/report-cards/bulk-print">
      <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Bulk Print Report Cards</Button>
    </Link>
  </div>
  <StudentResultsList reportCards />
  
</PageShell>; }

