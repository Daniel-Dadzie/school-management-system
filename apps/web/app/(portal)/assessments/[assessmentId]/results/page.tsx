"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FileSpreadsheet, Plus, XCircle } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { AssessmentStatusBadge } from "@/components/shared/assessment-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import { useAssessment, useAssessmentReferences, useAssessmentResults, useAssessmentRoster, useSaveAssessmentResult } from "@/hooks/use-assessments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";

const resultSchema = z.object({
  enrollmentId: z.string().min(1, "Choose a student."),
  score: z.number().finite().min(0, "Score cannot be negative."),
  outcome: z.enum(["PASSED", "FAILED"]),
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
  const rosterQuery = useAssessmentRoster(assessment?.classId ?? "", term?.academicYearId ?? "");
  const resultsQuery = useAssessmentResults(assessmentId);
  const saveResult = useSaveAssessmentResult(assessmentId);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const form = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema),
    defaultValues: { enrollmentId: "", score: 0, outcome: "PASSED" },
  });
  const { reset } = form;
  const enrollmentId = useWatch({ control: form.control, name: "enrollmentId" });
  const selectedRosterEntry = rosterQuery.data?.find((item) => item.enrollment.id === enrollmentId);
  const existingResult = resultsQuery.data?.find((result) => result.enrollmentId === enrollmentId);

  useEffect(() => {
    if (!enrollmentId || !selectedRosterEntry) return;
    reset({
      enrollmentId,
      score: existingResult?.score ?? 0,
      outcome: existingResult?.outcome ?? "PASSED",
    });
  }, [enrollmentId, existingResult, reset, selectedRosterEntry]);

  const onSubmit = form.handleSubmit((values) => {
    if (!selectedRosterEntry) return;
    saveResult.mutate({
      enrollmentId: values.enrollmentId,
      studentId: selectedRosterEntry.student.id,
      score: values.score,
      outcome: values.outcome,
    }, {
      onSuccess: () => {
        toast.success("Scores saved successfully.");
        setShowEntryForm(false);
      },
      onError: (error) => toast.error(error.message || "Unable to save result."),
    });
  });

  const loading = assessmentQuery.isLoading || referencesQuery.isLoading || resultsQuery.isLoading || rosterQuery.isLoading;
  const error = assessmentQuery.error ?? referencesQuery.error ?? resultsQuery.error ?? rosterQuery.error;
  const forbidden = error instanceof AssessmentDomainError && error.code === "FORBIDDEN";
  const assessmentTitle = assessment?.title ?? "Assessment results";
  const roster = rosterQuery.data ?? [];
  const results = resultsQuery.data ?? [];
  const joinedResults = results.flatMap((result) => {
    const rosterEntry = roster.find((entry) => entry.enrollment.id === result.enrollmentId);
    return rosterEntry ? [{ result, student: rosterEntry.student }] : [];
  });

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
            {canRecordResults && !showEntryForm && assessment.status !== "REJECTED" && (
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
                      {roster.map(({ enrollment, student }) => <option key={enrollment.id} value={enrollment.id}>{student.firstName} {student.lastName}</option>)}
                    </select>
                    {form.formState.errors.enrollmentId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.enrollmentId.message}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="result-score" className="text-sm font-medium">Score</label>
                      <Input id="result-score" type="number" min="0" step="0.01" inputMode="decimal" aria-invalid={Boolean(form.formState.errors.score)} {...form.register("score", { valueAsNumber: true })} />
                      {form.formState.errors.score && <p className="text-sm text-destructive" role="alert">{form.formState.errors.score.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="result-outcome" className="text-sm font-medium">Outcome</label>
                      <select id="result-outcome" className={selectClassName} {...form.register("outcome")}>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">A failed result does not create another assessment automatically.</p>
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
                      <p className="mt-1 text-sm text-muted-foreground">Score: {result.score}</p>
                    </div>
                    <AssessmentStatusBadge status={result.outcome} />
                  </article>
                );
              })}
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
