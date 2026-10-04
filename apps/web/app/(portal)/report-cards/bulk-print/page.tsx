"use client";

import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/use-students";
import { useAssessmentReferences } from "@/hooks/use-assessments";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { Printer, Users } from "lucide-react";
import { StudentReportCard } from "@/components/assessments/student-report-card";
import { permissions } from "@/lib/authorization/permissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function BulkPrintReportCards() {
  const studentsQuery = useStudents();
  const references = useAssessmentReferences();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTermId, setSelectedTermId] = useState<string>("");

  const years = references.data?.academicYears ?? [];
  const yearId = selectedYearId || years[0]?.id || "";
  const terms = useMemo(() => references.data?.terms.filter((term) => term.academicYearId === yearId) ?? [], [references.data?.terms, yearId]);
  const termId = terms.some((term) => term.id === selectedTermId) ? selectedTermId : terms[0]?.id || "";
  
  const classStudents = useMemo(() => {
    if (!studentsQuery.data || !selectedClassId) return [];
    return studentsQuery.data.filter(s => s.currentClassId === selectedClassId);
  }, [studentsQuery.data, selectedClassId]);

  const handlePrint = () => {
    window.print();
  };

  if (studentsQuery.isLoading || references.isLoading) {
    return (
      <PageShell title="Bulk Print Report Cards" description="Loading data..." breadcrumbs={[{ label: "Report cards", href: "/report-cards" }, { label: "Bulk Print" }]} permission={permissions.resultsView}>
        <div className="flex h-40 items-center justify-center">
          <LoadingSpinner />
        </div>
      </PageShell>
    );
  }

  if (studentsQuery.isError || references.isError) {
    return (
      <PageShell title="Bulk Print Report Cards" description="Error loading data." breadcrumbs={[{ label: "Report cards", href: "/report-cards" }, { label: "Bulk Print" }]} permission={permissions.resultsView}>
        <ErrorState title="Unable to load data" description="Try again later." />
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Bulk Print Report Cards" 
      description="Generate and print report cards for an entire class at once." 
      breadcrumbs={[{ label: "Report cards", href: "/report-cards" }, { label: "Bulk Print" }]} 
      permission={permissions.resultsView}
    >
      <div className="mb-8 space-y-4 rounded-lg border p-4 print:hidden bg-card">
        <h2 className="text-lg font-semibold">Print Configuration</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full sm:w-64">
            <Label htmlFor="bulk-year">Academic Year</Label>
            <select id="bulk-year" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={yearId} onChange={(event) => { setSelectedYearId(event.target.value); setSelectedTermId(""); }}>
              {years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 w-full sm:w-64">
            <Label htmlFor="bulk-term">Term</Label>
            <select id="bulk-term" className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm" value={termId} onChange={(event) => setSelectedTermId(event.target.value)}>
              {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 w-full sm:w-64">
            <Label>Select Class</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {references.data?.classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handlePrint} disabled={!selectedClassId || !yearId || !termId || classStudents.length === 0} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print {classStudents.length} Report Cards
          </Button>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="print:hidden">
          <EmptyState icon={Users} title="Select a class" description="Choose a class from the dropdown to load report cards." />
        </div>
      ) : classStudents.length === 0 ? (
        <div className="print:hidden">
          <EmptyState icon={Users} title="No students found" description="There are no students enrolled in the selected class." />
        </div>
      ) : (
        <div className="space-y-8 print:space-y-0">
          {classStudents.map((student) => (
            <div key={student.id} className="print:block print:break-after-page mb-8 border rounded-lg shadow-sm print:border-none print:shadow-none print:m-0 print:p-0">
              <StudentReportCard studentId={student.id} academicYearId={yearId} termId={termId} />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
