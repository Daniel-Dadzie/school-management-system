"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, GraduationCap, Search } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AuthorizationError, permissions } from "@/lib/authorization/permissions";
import { formatNumber, formatPercent } from "@/lib/format";
import { useConfirmPromotions, useInitiatePromotionReview, usePromotionReferences, usePromotionWorkspace } from "@/hooks/use-promotions";
import type { PromotionCandidate, PromotionInput } from "@/lib/functional/services/promotion-service";
import type { PromotionDecision } from "@/lib/functional/types";

type Choice = { decision: PromotionDecision; destinationClassId: string };

export default function PromotionsPage() {
  const references = usePromotionReferences();
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [notes, setNotes] = useState("");
  const [typedCount, setTypedCount] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const workspace = usePromotionWorkspace(academicYearId, classId);
  const confirmation = useConfirmPromotions();
  const initiation = useInitiatePromotionReview();

  const sourceClasses = (references.data?.classes ?? []).filter((schoolClass) => schoolClass.academicYearId === academicYearId);
  const sourceClass = sourceClasses.find((schoolClass) => schoolClass.id === classId);
  const destinationYear = references.data?.academicYears.find((year) => year.id === workspace.data?.destinationAcademicYearId);
  const destinationClasses = (references.data?.classes ?? []).filter((schoolClass) => schoolClass.academicYearId === destinationYear?.id);
  const candidates = workspace.data?.candidates;
  const candidateList = candidates ?? [];
  const visibleCandidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (candidates ?? []).filter((candidate) => !query || `${candidate.studentName} ${candidate.admissionNumber ?? ""}`.toLowerCase().includes(query));
  }, [candidates, search]);
  const selectedCandidates = candidateList.filter((candidate) => selectedIds.includes(candidate.studentId) && !candidate.alreadyEnrolled);
  const selectedRecords: PromotionInput[] = selectedCandidates.map((candidate) => ({
    studentId: candidate.studentId,
    sourceEnrollmentId: candidate.sourceEnrollmentId,
    decision: choices[candidate.studentId]?.decision ?? "PROMOTE",
    destinationClassId: choices[candidate.studentId]?.destinationClassId ?? "",
  }));
  const notesValid = notes.trim().length >= 10 && notes.trim().length <= 500;
  const typedCountValid = selectedRecords.length <= 1 || typedCount === formatNumber(selectedRecords.length);
  const canBeginReview = selectedRecords.length > 0 && selectedRecords.every((record) => record.destinationClassId);
  const canReview = canBeginReview && notesValid;

  const changeAcademicYear = (value: string) => {
    setAcademicYearId(value);
    setClassId("");
    setSelectedIds([]);
    setReviewing(false);
  };
  const setChoice = (studentId: string, change: Partial<Choice>) => {
    setChoices((current) => {
      const previous = current[studentId] ?? { decision: "PROMOTE", destinationClassId: "" };
      return { ...current, [studentId]: { ...previous, ...change } };
    });
  };
  const toggleCandidate = (studentId: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...new Set([...current, studentId])] : current.filter((id) => id !== studentId));
  };
  const submitPromotions = async () => {
    if (!classId || !academicYearId || !canReview || !typedCountValid) return;
    try {
      await confirmation.mutateAsync({ sourceAcademicYearId: academicYearId, sourceClassId: classId, records: selectedRecords, notes: notes.trim() });
      toast.success(`${formatNumber(selectedRecords.length)} student ${selectedRecords.length === 1 ? "enrollment" : "enrollments"} created successfully.`);
      setSelectedIds([]);
      setChoices({});
      setNotes("");
      setTypedCount("");
      setReviewing(false);
      setConfirmOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Promotions could not be completed. Review the selected records and try again.");
    }
  };
  const beginReview = async () => {
    if (!academicYearId || !classId || !canBeginReview) return;
    setNotes("");
    setTypedCount("");
    setConfirmOpen(false);
    try {
      await initiation.mutateAsync({ sourceAcademicYearId: academicYearId, sourceClassId: classId, records: selectedRecords });
      setReviewing(true);
    } catch {
      toast.error("The promotion review could not be started. Refresh the student list and try again.");
    }
  };

  return (
    <PageShell title="Student promotions" description="Review each student and create an enrollment for the next academic year." breadcrumbs={[{ label: "Academic setup", href: "/academic-setup" }, { label: "Promotions" }]} permission={permissions.promotionsManage}>
      {references.isLoading ? <div className="flex min-h-40 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2">Loading promotion options...</span></div>
        : references.error instanceof AuthorizationError ? <ForbiddenState title="Promotion access denied" />
          : references.isError ? <ErrorState title="Unable to load promotion options" description="Refresh the page and try again." onRetry={() => void references.refetch()} />
            : reviewing ? (
              <section aria-labelledby="promotion-review-title" className="space-y-4">
                <Card>
                  <CardHeader><CardTitle id="promotion-review-title">Review promotion</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">These decisions create next-year enrollments. Existing enrollment records remain unchanged.</p>
                    <ul className="divide-y" aria-label="Selected promotion decisions">
                      {selectedRecords.map((record) => {
                        const candidate = selectedCandidates.find((item) => item.studentId === record.studentId);
                        const destination = destinationClasses.find((item) => item.id === record.destinationClassId);
                        return <li key={record.studentId} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="font-medium">{candidate?.studentName}</span><span>{record.decision === "PROMOTE" ? "Promote" : "Retain"} to {destination?.name ?? "Choose a destination class"}</span></li>;
                      })}
                    </ul>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={confirmation.isPending} onClick={() => setReviewing(false)}>Back to students</Button><Button type="button" disabled={confirmation.isPending} onClick={() => setConfirmOpen(true)}>Continue to confirmation</Button></div>
                  </CardContent>
                </Card>
                <Dialog open={confirmOpen} onOpenChange={(open) => { if (!confirmation.isPending) setConfirmOpen(open); }}>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Confirm {formatNumber(selectedRecords.length)} academic {selectedRecords.length === 1 ? "decision" : "decisions"}?</DialogTitle><DialogDescription>This creates {selectedRecords.length === 1 ? "a new enrollment" : "new enrollments"} for {destinationYear?.name}. Existing academic history stays unchanged. This action cannot be undone.</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label htmlFor="promotion-reason">Reason (required)</Label><Textarea id="promotion-reason" value={notes} maxLength={500} onChange={(event) => setNotes(event.target.value)} aria-describedby="promotion-reason-help" /><p id="promotion-reason-help" className="text-sm text-muted-foreground">Enter 10 to 500 characters for the audit record.</p>{notes.length > 0 && notes.trim().length < 10 && <p className="text-sm text-destructive">Add at least 10 characters.</p>}</div>
                      {selectedRecords.length > 1 && <div className="space-y-2"><Label htmlFor="promotion-count">Type “{formatNumber(selectedRecords.length)}” to confirm this bulk action</Label><Input id="promotion-count" value={typedCount} onChange={(event) => setTypedCount(event.target.value)} /></div>}
                      {confirmation.error && <p role="alert" className="text-sm text-destructive">The records changed while you were reviewing. Refresh the list and review the promotion again.</p>}
                    </div>
                    <DialogFooter><Button type="button" variant="outline" disabled={confirmation.isPending} onClick={() => setConfirmOpen(false)}>Cancel</Button><Button type="button" variant="destructive" disabled={!canReview || !typedCountValid || confirmation.isPending} onClick={() => void submitPromotions()}>{confirmation.isPending ? "Creating enrollments..." : "Confirm decisions"}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </section>
            ) : (
              <div className="space-y-5">
                <Card>
                  <CardHeader><CardTitle>Promotion period</CardTitle></CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2"><Label htmlFor="source-year">Academic year</Label><select id="source-year" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={academicYearId} onChange={(event) => changeAcademicYear(event.target.value)}><option value="">Select an academic year</option>{references.data?.academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></div>
                    <div className="space-y-2"><Label htmlFor="source-class">Current class</Label><select id="source-class" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={classId} onChange={(event) => { setClassId(event.target.value); setSelectedIds([]); setReviewing(false); }} disabled={!academicYearId}><option value="">Select a class</option>{sourceClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select></div>
                    <div className="space-y-2"><Label>Next academic year</Label><div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm">{destinationYear?.name ?? (academicYearId ? "No later academic year configured" : "Select an academic year")}</div></div>
                  </CardContent>
                </Card>
                {academicYearId && classId && workspace.isLoading ? <div className="flex min-h-40 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2">Loading students...</span></div>
                  : workspace.error instanceof AuthorizationError ? <ForbiddenState title="Promotion access denied" />
                    : workspace.isError ? <ErrorState title="Unable to load students" description="Refresh the list and try again." onRetry={() => void workspace.refetch()} />
                      : academicYearId && classId && (!destinationYear || !destinationClasses.length) ? <EmptyState icon={AlertCircle} title="Next-year classes are unavailable" description="Create the next academic year and its classes before starting promotion." />
                        : academicYearId && classId && !candidateList.length ? <EmptyState icon={GraduationCap} title="No active students in this class" description="Students with active enrollments in the selected class will appear here." />
                          : candidateList.length > 0 && (
                            <section aria-label="Students for promotion" className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input className="pl-9" type="search" aria-label="Search students" placeholder="Search by name or student number" value={search} onChange={(event) => setSearch(event.target.value)} /></div><label className="flex min-h-11 items-center gap-2 text-sm md:hidden"><input type="checkbox" checked={visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).length > 0 && visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).every((candidate) => selectedIds.includes(candidate.studentId))} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).map((candidate) => candidate.studentId)])] : selectedIds.filter((id) => !visibleCandidates.some((candidate) => candidate.studentId === id)))} />Select all eligible students</label><Button type="button" disabled={!canBeginReview || initiation.isPending} onClick={() => void beginReview()}>{initiation.isPending ? "Preparing review..." : `Review ${formatNumber(selectedRecords.length)} selected`}</Button></div>
                              <div className="overflow-hidden rounded-md border">
                                <div className="hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr><th className="p-3"><input aria-label="Select all eligible students" type="checkbox" checked={visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).length > 0 && visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).every((candidate) => selectedIds.includes(candidate.studentId))} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...visibleCandidates.filter((candidate) => !candidate.alreadyEnrolled).map((candidate) => candidate.studentId)])] : selectedIds.filter((id) => !visibleCandidates.some((candidate) => candidate.studentId === id)))} /></th><th className="p-3">Student</th><th className="p-3">Academic summary</th><th className="p-3">Decision</th><th className="p-3">Destination class</th></tr></thead><tbody className="divide-y">{visibleCandidates.map((candidate) => <tr key={candidate.studentId} className={candidate.alreadyEnrolled ? "bg-muted/50" : ""}><td className="p-3"><input aria-label={`Select ${candidate.studentName}`} type="checkbox" disabled={candidate.alreadyEnrolled} checked={selectedIds.includes(candidate.studentId)} onChange={(event) => toggleCandidate(candidate.studentId, event.target.checked)} /></td><td className="p-3"><span className="font-medium">{candidate.studentName}</span>{candidate.admissionNumber && <span className="block text-xs text-muted-foreground">{candidate.admissionNumber}</span>}{candidate.alreadyEnrolled && <span className="text-xs text-muted-foreground">Already enrolled next year</span>}</td><td className="p-3"><AcademicSummaryView summary={candidate.academicSummary} /></td><td className="p-3"><select className="h-10 rounded-md border bg-background px-2" aria-label={`Decision for ${candidate.studentName}`} value={choices[candidate.studentId]?.decision ?? "PROMOTE"} disabled={candidate.alreadyEnrolled} onChange={(event) => setChoice(candidate.studentId, { decision: event.target.value as PromotionDecision })}><option value="PROMOTE">Promote</option><option value="RETAIN">Retain</option></select></td><td className="p-3"><select className="h-10 min-w-36 rounded-md border bg-background px-2" aria-label={`Destination class for ${candidate.studentName}`} value={choices[candidate.studentId]?.destinationClassId ?? ""} disabled={candidate.alreadyEnrolled} onChange={(event) => setChoice(candidate.studentId, { destinationClassId: event.target.value })}><option value="">Select class</option>{destinationClasses.filter((destination) => choices[candidate.studentId]?.decision !== "RETAIN" || destination.gradeLevel === sourceClass?.gradeLevel).map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select></td></tr>)}</tbody></table></div>
                                <ul className="divide-y md:hidden" aria-label="Students for promotion">{visibleCandidates.map((candidate) => <li key={candidate.studentId} className="space-y-3 p-4"><div className="flex items-start gap-3"><input className="mt-1" aria-label={`Select ${candidate.studentName}`} type="checkbox" disabled={candidate.alreadyEnrolled} checked={selectedIds.includes(candidate.studentId)} onChange={(event) => toggleCandidate(candidate.studentId, event.target.checked)} /><div><p className="font-medium">{candidate.studentName}</p><p className="text-xs text-muted-foreground">{candidate.alreadyEnrolled ? "Already enrolled next year" : candidate.admissionNumber ?? "Student"}</p></div></div><AcademicSummaryView summary={candidate.academicSummary} /><div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1"><Label htmlFor={`decision-${candidate.studentId}`}>Decision</Label><select id={`decision-${candidate.studentId}`} className="h-10 w-full rounded-md border bg-background px-2" value={choices[candidate.studentId]?.decision ?? "PROMOTE"} disabled={candidate.alreadyEnrolled} onChange={(event) => setChoice(candidate.studentId, { decision: event.target.value as PromotionDecision })}><option value="PROMOTE">Promote</option><option value="RETAIN">Retain</option></select></div><div className="space-y-1"><Label htmlFor={`destination-${candidate.studentId}`}>Destination class</Label><select id={`destination-${candidate.studentId}`} className="h-10 w-full rounded-md border bg-background px-2" value={choices[candidate.studentId]?.destinationClassId ?? ""} disabled={candidate.alreadyEnrolled} onChange={(event) => setChoice(candidate.studentId, { destinationClassId: event.target.value })}><option value="">Select class</option>{destinationClasses.filter((destination) => choices[candidate.studentId]?.decision !== "RETAIN" || destination.gradeLevel === sourceClass?.gradeLevel).map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select></div></div></li>)}</ul>
                              </div>
                              {visibleCandidates.length === 0 && <EmptyState icon={Search} title="No students match your search" description="Try another name or student number." action={<Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>} />}
                              {selectedIds.length > 0 && !canBeginReview && <p className="text-sm text-muted-foreground">Select a destination class for every student before opening the review.</p>}
                            </section>
                          )}
              </div>
            )}
    </PageShell>
  );
}

function AcademicSummaryView({ summary }: { summary: PromotionCandidate["academicSummary"] }) {
  if (!summary) return <span className="text-muted-foreground">No finalized result summary</span>;
  return <div className="space-y-1">
    <p>{summary.termName}: {summary.averagePercentage === undefined ? "Results incomplete" : `${formatPercent(summary.averagePercentage)} average`} · {formatNumber(summary.completedSubjects)} completed subjects</p>
    <p className="text-xs text-muted-foreground">Latest-term attendance: {formatNumber(summary.attendance.present)} present, {formatNumber(summary.attendance.absent)} absent, {formatNumber(summary.attendance.late)} late</p>
    {summary.subjects.length > 0 && <details className="text-xs"><summary className="cursor-pointer underline underline-offset-2">Latest-term subject results</summary><ul className="mt-1 space-y-1">{summary.subjects.map((subject) => <li key={subject.name}>{subject.name}: {formatPercent(subject.percentage)}{subject.grade ? ` · ${subject.grade}` : ""}</li>)}</ul></details>}
  </div>;
}
