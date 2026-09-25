"use client";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileSpreadsheet } from "lucide-react";

export default function AssessmentDetail() {
  const { assessmentId } = useParams();

  return (
    <PageShell title={`Assessment ${assessmentId}`} breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: "Detail" }]} allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Assessment {assessmentId}</h2>
          <Link href={`/assessments/${assessmentId}/results`}>
            <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Manage Results</Button>
          </Link>
        </div>
        
        <div className="p-4 border rounded shadow-sm">
           <h3 className="text-lg font-semibold mb-2">Details</h3>
           <p className="text-sm text-muted-foreground">Status: DRAFT</p>
           <p className="text-sm text-muted-foreground">Current/Final: false</p>
           
           <div className="mt-4 space-x-2">
             <Button variant="outline">Edit</Button>
             <Button variant="destructive">Reject</Button>
           </div>
        </div>
      </div>
    </PageShell>
  );
}