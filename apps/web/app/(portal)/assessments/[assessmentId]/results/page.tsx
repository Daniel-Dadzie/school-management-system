"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, XCircle, LockKeyhole, Globe } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import { useAssessment, useAssessmentReferences, useAssessmentResults, useAssessmentRoster, useSaveAssessmentResult, useSaveAssessmentResults, useFinalizeAssessmentResults, useGradeScales, usePreviewAssessmentResults } from "@/hooks/use-assessments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";

const resultSchema = z.object({
  enrollmentId: z.string().min(1, "Choose a student."),
  score: z.number().finite().min(0, "Score cannot be negative."),
});
type ResultFormValues = z.infer<typeof resultSchema>;

const selectClassName = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function AssessmentResults() {
  const role = useAuthStore((state) => state.user?.role);
  const canRecordResults = hasPermission(role, permissions.resultsManage);
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const assessmentQuery = useAssessment(assessmentId);
  const referencesQuery = useAssessmentReferences();
  const assessment = assessmentQuery.data;
  const term = referencesQuery.data?.terms.find((record) => record.id === assessment?.termId);
  const rosterQuery = useAssessmentRoster(assessment?.teacherAssignmentId ?? "");
  const resultsQuery = useAssessmentResults(assessmentId);
  const saveResult = useSaveAssessmentResult(assessmentId);
  const finalizeResults = useFinalizeAssessmentResults(assessmentId);
  const scalesQuery = useGradeScales();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: { enrollmentId: "", score: 0 },
  });
  const { reset } = form;
  const enrollmentId = useWatch({ control: form.control, name: "enrollmentId" });
  const selectedRosterEntry = rosterQuery.data?.find((item) => item.enrollmentId === enrollmentId);
  const existingResult = resultsQuery.data?.find((result) => result.enrollmentId === enrollmentId);

  useEffect(() => {
    if (!enrollmentId || !selectedRosterEntry) return;
    reset({
      enrollmentId,
      score: existingResult?.score ?? 0,
    });
  }, [enrollmentId, existingResult, reset, selectedRosterEntry]);

  const onSubmit = form.handleSubmit((values) => {
    if (!selectedRosterEntry) return;
    saveResult.mutate({
      enrollmentId: values.enrollmentId,
      studentId: selectedRosterEntry.student.id,
      score: values.score,
    }, {
      onSuccess: () => {
        toast.success("Scores saved successfully.");
        setShowEntryForm(false);
      },
      onError: (error) => toast.error(error.message || "Unable to save result."),
    });
  });

  const loading = assessmentQuery.isLoading || referencesQuery.isLoading || resultsQuery.isLoading || rosterQuery.isLoading || scalesQuery.isLoading;
  const error = assessmentQuery.error ?? referencesQuery.error ?? resultsQuery.error ?? rosterQuery.error ?? scalesQuery.error;
  const forbidden = error instanceof AssessmentDomainError && error.code === "FORBIDDEN";
  const assessmentTitle = assessment?.title ?? "Assessment results";
  const roster = rosterQuery.data ?? [];
  const results = resultsQuery.data ?? [];
  const joinedResults = results.flatMap((result) => {
    const rosterEntry = roster.find((entry) => entry.enrollmentId === result.enrollmentId);
    return rosterEntry ? [{ result, student: rosterEntry.student }] : [];
  });
  const academicYearId = term?.academicYearId;
  const activeScale = scalesQuery.data?.find((scale) => scale.academicYearId === academicYearId && scale.isActive);
  const allFinalized = joinedResults.length > 0 && joinedResults.every(({ result }) => result.status === "FINALIZED");

  return (
    <PageShell
      title="Assessment results"
      description={assessmentTitle}
      breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: assessmentTitle, href: `/assessments/${assessmentId}` }, { label: "Results" }]}
      permission={permissions.assessmentResultsView}
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading results...</span></div>
      ) : forbidden ? (
        <ForbiddenState title="Assessment access denied" />
      ) : error ? (
        <ErrorState title="Unable to load assessment results" description="Try again to load the assessment and its results." onRetry={() => {
          void assessmentQuery.refetch();
          void referencesQuery.refetch();
          void resultsQuery.refetch();
          void rosterQuery.refetch();
        }} />
      ) : !assessment ? (
        <EmptyState title="Assessment not found" description="This assessment may have been removed from the mock data." action={<Button asChild variant="outline"><Link href="/assessments">Back to assessments</Link></Button>} />
      ) : (
        <div className="max-w-4xl space-y-4">
          <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">{assessment.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {referencesQuery.data?.classes.find((record) => record.id === assessment.classId)?.name ?? "Class unavailable"} · {referencesQuery.data?.subjects.find((record) => record.id === assessment.subjectId)?.name ?? "Subject unavailable"} · {term?.name ?? "Term unavailable"}
              </p>
            </div>
            {canRecordResults && !showEntryForm && assessment.status !== "REJECTED" && !allFinalized && (
              <Button onClick={() => setShowEntryForm(true)}><Plus aria-hidden="true" /> Enter results</Button>
            )}
          </section>

          {canRecordResults && showEntryForm && assessment.status !== "REJECTED" && (
            <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-lg border bg-card p-5">
              <h2 className="font-semibold">Enter student result</h2>
              {roster.length === 0 ? (
                <EmptyState title="No enrolled students" description="This class has no active enrollments for the assessment year." action={<Button type="button" variant="outline" onClick={() => setShowEntryForm(false)}>Close</Button>} />
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="result-enrollment" className="text-sm font-medium">Student</label>
                    <select id="result-enrollment" className={selectClassName} aria-invalid={Boolean(form.formState.errors.enrollmentId)} {...form.register("enrollmentId")}>
                      <option value="">Choose a student</option>
                      {roster.map(({ enrollmentId, student }) => <option key={enrollmentId} value={enrollmentId}>{student.firstName} {student.lastName}</option>)}
                    </select>
                    {form.formState.errors.enrollmentId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.enrollmentId.message}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="result-score" className="text-sm font-medium">Raw score (out of {assessment.maximumScore ?? 100})</label>
                      <Input id="result-score" type="number" min="0" max={assessment.maximumScore ?? 100} step="0.01" inputMode="decimal" aria-invalid={Boolean(form.formState.errors.score)} {...form.register("score", { valueAsNumber: true })} />
                      {form.formState.errors.score && <p className="text-sm text-destructive" role="alert">{form.formState.errors.score.message}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Grades and remarks are calculated from the academic year grading scale.</p>
                  {saveResult.isError && <p className="text-sm text-destructive" role="alert">{saveResult.error.message || "Unable to save result."}</p>}
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" disabled={saveResult.isPending} onClick={() => setShowEntryForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={saveResult.isPending || (Boolean(existingResult) && !form.formState.isDirty)}>
                      {saveResult.isPending ? "Saving..." : existingResult ? "Update result" : "Save result"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}

          {assessment.status === "REJECTED" && <div className="rounded-md border border-destructive p-4 text-sm" role="status"><XCircle className="mr-2 inline h-4 w-4 text-destructive" aria-hidden="true" />This assessment was rejected. Results cannot be changed.</div>}

          {joinedResults.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No results found"
              description="No student results have been entered for this assessment yet."
              action={canRecordResults && assessment.status !== "REJECTED" && !showEntryForm ? <Button onClick={() => setShowEntryForm(true)}>Enter results</Button> : undefined}
            />
          ) : (
            <section aria-label="Student results" className="space-y-3">
              {joinedResults.map(({ result, student }) => {
                return (
                  <article key={result.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium">{student.firstName} {student.lastName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Raw score: {result.score} / {assessment.maximumScore ?? 100} · {Math.round((result.score / (assessment.maximumScore ?? 100)) * 10000) / 100}%</p>
                      {activeScale && (() => { const percentage = (result.score / (assessment.maximumScore ?? 100)) * 100; const band = activeScale.bands.find((entry) => percentage >= entry.minimumPercentage && percentage <= entry.maximumPercentage); return band ? <p className="text-sm">Grade {band.grade} · {band.remark}{band.gradePoint !== undefined ? ` · ${band.gradePoint} points` : ""}</p> : <p className="text-sm text-destructive">No configured grade band covers this score.</p>; })()}
                    </div>
                    <span className="rounded-full border px-2.5 py-1 text-xs">{result.status === "FINALIZED" ? "Finalized" : "Entered"}</span>
                  </article>
                );
              })}
            </section>
          )}
          {canRecordResults && assessment.status !== "REJECTED" && <BulkScoreGrid assessmentId={assessmentId} maximumScore={assessment.maximumScore ?? 100} roster={roster} results={results} disabled={allFinalized} />}

          {/* Lifecycle status banner */}
          {assessment.lifecycleStatus && assessment.lifecycleStatus !== "DRAFT" && (
            <div className={`rounded-md border p-4 text-sm ${assessment.lifecycleStatus === "PUBLISHED" ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300" : "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"}`} role="status">
              {assessment.lifecycleStatus === "SUBMITTED" && <><Globe className="mr-1.5 inline h-4 w-4" aria-hidden="true" />These results have been submitted for review. Scores are locked until reverted to draft.</>}
              {assessment.lifecycleStatus === "REVIEWED" && <><Globe className="mr-1.5 inline h-4 w-4" aria-hidden="true" />Results have been reviewed and are awaiting publication by an administrator.</>}
              {assessment.lifecycleStatus === "PUBLISHED" && <><Globe className="mr-1.5 inline h-4 w-4" aria-hidden="true" />Results are published and visible to parents.</>}
            </div>
          )}

          {canRecordResults && assessment.status !== "REJECTED" && !allFinalized && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={finalizeResults.isPending || !activeScale || results.length === 0}
                onClick={() => setFinalizeOpen(true)}
              >
                <LockKeyhole aria-hidden="true" className="mr-1.5 h-4 w-4" />
                {finalizeResults.isPending ? "Submitting…" : "Submit results for review"}
              </Button>
            </div>
          )}
          {finalizeResults.isError && <p role="alert" className="text-sm text-destructive">{finalizeResults.error.message}</p>}

          <ConfirmationDialog
            open={finalizeOpen}
            onOpenChange={setFinalizeOpen}
            title="Submit results for review?"
            description="This will lock scores and submit the assessment for administrator review before publication. You can ask an administrator to revert to draft if corrections are needed."
            confirmText={finalizeResults.isPending ? "Submitting…" : "Submit for review"}
            onConfirm={() => finalizeResults.mutate(undefined, {
              onSuccess: () => {
                setFinalizeOpen(false);
                toast.success("Results submitted for review.");
              },
              onError: (mutationError) => toast.error(mutationError.message || "Unable to submit results."),
            })}
            confirmDisabled={finalizeResults.isPending}
          />
        </div>
      )}
    </PageShell>
  );
}

function BulkScoreGrid({ assessmentId, maximumScore, roster, results, disabled }: {
  assessmentId: string;
  maximumScore: number;
  roster: Array<{ enrollmentId: string; student: { id: string; firstName: string; lastName: string } }>;
  results: Array<{ enrollmentId: string; studentId: string; score: number; status?: "ENTERED" | "FINALIZED" }>;
  disabled: boolean;
}) {
  const save = useSaveAssessmentResults(assessmentId);
  const [scores, setScores] = useState<Record<string, string>>({});
  const scoreFor = (enrollmentId: string) => scores[enrollmentId] ?? String(results.find((result) => result.enrollmentId === enrollmentId)?.score ?? "");
  const previewInputs = useMemo(() => roster.map(({ enrollmentId, student }) => {
    const raw = scores[enrollmentId] ?? String(results.find((result) => result.enrollmentId === enrollmentId)?.score ?? "");
    return { enrollmentId, studentId: student.id, score: raw.trim() ? Number(raw) : null };
  }), [roster, results, scores]);
  const preview = usePreviewAssessmentResults(assessmentId, previewInputs);
  const onSave = () => {
    save.mutate(previewInputs, { onSuccess: (saved) => { setScores({}); toast.success(`${saved.length} student score${saved.length === 1 ? "" : "s"} saved.`); }, onError: (error) => toast.error(error.message || "Unable to save scores.") });
  };
  if (!roster.length) return null;
  return <section aria-label="Bulk score entry" className="space-y-3 rounded-lg border bg-card p-4">
    <div><h2 className="font-semibold">Class score entry</h2><p className="mt-1 text-sm text-muted-foreground">Enter raw scores out of {maximumScore}. Blank rows are skipped. Grades and contributions are calculated from the configured scale and weight.</p></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b text-left"><th className="px-2 py-2">Student</th><th className="px-2 py-2">Raw score / {maximumScore}</th><th className="px-2 py-2">Percentage</th><th className="px-2 py-2">Grade</th><th className="px-2 py-2">Weighted contribution</th><th className="px-2 py-2">Status</th></tr></thead><tbody>{roster.map(({ enrollmentId, student }) => {
      const result = results.find((item) => item.enrollmentId === enrollmentId);
      const scoreText = scoreFor(enrollmentId);
      const score = scoreText.trim() ? Number(scoreText) : undefined;
      const evaluation = preview.data?.find((item) => item.enrollmentId === enrollmentId);
      return <tr key={enrollmentId} className="border-b last:border-0"><td className="px-2 py-2 font-medium">{student.firstName} {student.lastName}</td><td className="px-2 py-2"><Input aria-label={`${student.firstName} ${student.lastName} score`} type="number" min="0" max={maximumScore} step="0.01" value={scoreText} disabled={disabled || result?.status === "FINALIZED" || save.isPending} onChange={(event) => setScores((current) => ({ ...current, [enrollmentId]: event.target.value }))} /></td><td className="px-2 py-2">{evaluation && evaluation.percentage !== undefined ? `${evaluation.percentage.toFixed(2)}%` : score === undefined ? "—" : "Invalid"}</td><td className="px-2 py-2">{evaluation ? `${evaluation.grade} · ${evaluation.remark}` : "—"}</td><td className="px-2 py-2">{evaluation && evaluation.weightedContribution !== undefined ? `${evaluation.weightedContribution.toFixed(2)}%` : "—"}</td><td className="px-2 py-2">{result?.status === "FINALIZED" ? "Finalized" : result ? "Entered" : "Not entered"}</td></tr>;
    })}</tbody></table></div>
    {preview.isError && <p role="alert" className="text-sm text-destructive">{preview.error.message}</p>}
    {save.isError && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
    <div className="flex justify-end"><Button onClick={onSave} disabled={disabled || save.isPending || !previewInputs.some((input) => input.score !== null)}>{save.isPending ? "Saving scores…" : "Save all entered scores"}</Button></div>
  </section>;
}
