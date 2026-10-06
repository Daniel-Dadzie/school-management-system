"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAssessmentReferences } from "@/hooks/use-assessments";
import { useReportSnapshots, usePublishSnapshot, useBulkPublishSnapshots } from "@/hooks/use-reporting";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { StudentAdapter } from "@/lib/functional/adapters/student-adapter";
import { useQuery } from "@tanstack/react-query";

export default function ReportArchivePage() {

  const { data: references, isLoading: isLoadingReferences } = useAssessmentReferences();
  
  const [academicYearId, setAcademicYearId] = useState<string>("");
  const [termId, setTermId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");

  const { data: snapshots, isLoading: isLoadingSnapshots, refetch } = useReportSnapshots(academicYearId, termId, classId);
  const publishSnapshot = usePublishSnapshot();
  const bulkPublish = useBulkPublishSnapshots();

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => StudentAdapter.getStudents(),
  });

  const filteredTerms = references?.terms.filter(t => t.academicYearId === academicYearId) || [];

  function handlePublish(id: string) {
    publishSnapshot.mutate(id, {
      onSuccess: () => {
        toast("Report Published", { description: "The report is now available to parents." });
      }
    });
  }

  function handleBulkPublish() {
    if (!snapshots) return;
    const draftIds = snapshots.filter(s => s.status === 'DRAFT').map(s => s.id);
    if (draftIds.length === 0) return;

    bulkPublish.mutate(draftIds, {
      onSuccess: () => {
        toast("Reports Published", { description: `${draftIds.length} reports are now published.` });
      }
    });
  }

  const isLoading = isLoadingReferences || isLoadingSnapshots;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Report Card Archive</h3>
          <p className="text-sm text-muted-foreground">
            Review generated report cards and publish them to the Parent Portal.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>Select a class and term to view generated reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select onValueChange={(v) => { setAcademicYearId(v); setTermId(""); }} value={academicYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  {references?.academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select onValueChange={setTermId} value={termId} disabled={!academicYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select onValueChange={setClassId} value={classId}>
                <SelectTrigger>
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {references?.classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => refetch()} disabled={!academicYearId || !termId || !classId}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {academicYearId && termId && classId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Snapshots</CardTitle>
              <CardDescription>
                {snapshots?.length || 0} reports found.
              </CardDescription>
            </div>
            {snapshots && snapshots.some(s => s.status === 'DRAFT') && (
              <Button onClick={handleBulkPublish} disabled={bulkPublish.isPending}>
                {bulkPublish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish All Drafts
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : snapshots?.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">No reports generated for this selection.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {snapshots?.map((snapshot) => {
                    const student = students?.find(s => s.id === snapshot.studentId);
                    return (
                      <TableRow key={snapshot.id}>
                        <TableCell className="font-medium">
                          {student ? `${student.firstName} ${student.lastName}` : snapshot.studentId}
                        </TableCell>
                        <TableCell>{snapshot.overallScore}</TableCell>
                        <TableCell>{snapshot.overallGrade}</TableCell>
                        <TableCell>{snapshot.overallRank || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={snapshot.status === 'PUBLISHED' ? "default" : "secondary"}>
                            {snapshot.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {snapshot.status === 'DRAFT' ? (
                            <Button variant="outline" size="sm" onClick={() => handlePublish(snapshot.id)}>
                              Publish
                            </Button>
                          ) : (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CheckCircle className="mr-1 h-4 w-4" /> Published
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
