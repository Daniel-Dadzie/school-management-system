"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Send, Eye, Globe, RotateCcw, XCircle } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { AssessmentStatusBadge } from "@/components/shared/assessment-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import { useAssessment, useAssessmentReferences, useAssessmentResults, useRejectAssessment, useUpdateAssessment, useSubmitAssessment, useReviewAssessment, usePublishAssessment } from "@/hooks/use-assessments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";

const editSchema = z.object({
  title: z.string().trim().min(2, "Enter an assessment title.").max(120, "Use 120 characters or fewer."),
  teacherAssignmentId: z.string().min(1, "Choose an assignment."),
  categoryId: z.string().min(1, "Choose a category."),
  assessmentDate: z.string().min(1, "Choose an assessment date."),
  description: z.string().max(500, "Use 500 characters or fewer."),
  maximumScore: z.number().finite().positive("Maximum score must be greater than zero."),
  weightPercent: z.number().finite().positive("Weight must be greater than zero.").max(100, "Weight cannot exceed 100%."),
  isCurrentFinal: z.boolean(),
});
type EditValues = z.infer<typeof editSchema>;

const selectClassName = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function AssessmentDetail() {
  const role = useAuthStore((state) => state.user?.role);
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const assessmentQuery = useAssessment(assessmentId);
  const referencesQuery = useAssessmentReferences();
  const resultsQuery = useAssessmentResults(assessmentId);
  const updateAssessment = useUpdateAssessment(assessmentId);
  const rejectAssessment = useRejectAssessment(assessmentId);
  const submitAssessment = useSubmitAssessment(assessmentId);
  const reviewAssessment = useReviewAssessment(assessmentId);
  const publishAssessment = usePublishAssessment(assessmentId);
  const [editing, setEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: "", teacherAssignmentId: "", categoryId: "", assessmentDate: "", description: "", maximumScore: 100, weightPercent: 100, isCurrentFinal: false },
  });
  const { reset } = form;
  const terms = referencesQuery.data?.terms ?? [];
  const classes = referencesQuery.data?.classes ?? [];
  const subjects = referencesQuery.data?.subjects ?? [];
  const myAssignments = referencesQuery.data?.myAssignments ?? [];
  const assessment = assessmentQuery.data;
  const canManageAssessments = hasPermission(role, permissions.assessmentsManage);
  const canRecordResults = hasPermission(role, permissions.resultsManage);
  const canAdminLifecycle = role === "ADMIN" || role === "SUPER_ADMIN";
  const lifecycleStatus = assessment?.lifecycleStatus;

  useEffect(() => {
    if (!assessment || !referencesQuery.data) return;
    reset({
      title: assessment.title,
      teacherAssignmentId: assessment.teacherAssignmentId,
      categoryId: assessment.categoryId ?? "",
      assessmentDate: assessment.assessmentDate ?? "",
      description: assessment.description ?? "",
      maximumScore: assessment.maximumScore ?? 100,
      weightPercent: assessment.weightPercent ?? 100,
      isCurrentFinal: assessment.isCurrentFinal,
    });
  }, [assessment, referencesQuery.data, reset]);

  const onSubmit = form.handleSubmit((values) => {
    updateAssessment.mutate({
      title: values.title,
      teacherAssignmentId: values.teacherAssignmentId,
      categoryId: values.categoryId,
      assessmentDate: values.assessmentDate,
      description: values.description || undefined,
      maximumScore: values.maximumScore,
      weightPercent: values.weightPercent,
      isCurrentFinal: values.isCurrentFinal,
    }, {
      onSuccess: () => {
        setEditing(false);
        toast.success("Assessment updated successfully.");
      },
      onError: (error) => toast.error(error.message || "Unable to update assessment."),
    });
  });

  const loading = assessmentQuery.isLoading || referencesQuery.isLoading;
  const error = assessmentQuery.error ?? referencesQuery.error;
  const forbidden = error instanceof AssessmentDomainError && error.code === "FORBIDDEN";
  const rejected = assessment?.status === "REJECTED";
  const finalizedCount = resultsQuery.data?.filter((result) => result.status === "FINALIZED").length ?? 0;
  const recordCount = resultsQuery.data?.length ?? 0;
  const category = referencesQuery.data?.categories.find((record) => record.id === assessment?.categoryId);
  const term = referencesQuery.data?.terms.find((record) => record.id === assessment?.termId);
  const schoolClass = referencesQuery.data?.classes.find((record) => record.id === assessment?.classId);
  const subject = referencesQuery.data?.subjects.find((record) => record.id === assessment?.subjectId);

  return (
    <PageShell
      title="Assessment details"
      description={assessment?.title}
      breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: "Details" }]}
      permission={permissions.assessmentsView}
      actions={assessment && <Button variant="outline" asChild><Link href={`/assessments/${assessment.id}/results`}><FileSpreadsheet aria-hidden="true" />{canRecordResults ? " Enter results" : " View results"}</Link></Button>}
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading assessment...</span></div>
      ) : forbidden ? (
        <ForbiddenState title="Assessment access denied" />
      ) : error ? (
        <ErrorState title="Unable to load assessment" description="Try again to load this assessment." onRetry={() => {
          void assessmentQuery.refetch();
          void referencesQuery.refetch();
        }} />
      ) : !assessment ? (
        <EmptyState title="Assessment not found" description="This assessment may have been removed from the mock data." action={<Button asChild variant="outline"><Link href="/assessments">Back to assessments</Link></Button>} />
      ) : (
        <div className="max-w-3xl space-y-4">
          {editing ? (
            <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-lg border bg-card p-5">
              <h2 className="font-semibold">Edit assessment</h2>
              <div className="space-y-2">
                <label htmlFor="edit-assessment-title" className="text-sm font-medium">Assessment title</label>
                <Input id="edit-assessment-title" aria-invalid={Boolean(form.formState.errors.title)} {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive" role="alert">{form.formState.errors.title.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><label htmlFor="edit-assessment-category" className="text-sm font-medium">Category</label><select id="edit-assessment-category" className={selectClassName} {...form.register("categoryId")}><option value="">Choose a category</option>{referencesQuery.data?.categories.filter((category) => category.isActive).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{form.formState.errors.categoryId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.categoryId.message}</p>}</div>
                <div className="space-y-2"><label htmlFor="edit-assessment-date" className="text-sm font-medium">Assessment date</label><Input id="edit-assessment-date" type="date" {...form.register("assessmentDate")} />{form.formState.errors.assessmentDate && <p className="text-sm text-destructive" role="alert">{form.formState.errors.assessmentDate.message}</p>}</div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><label htmlFor="edit-assessment-maximum" className="text-sm font-medium">Maximum score</label><Input id="edit-assessment-maximum" type="number" min="0.01" step="0.01" {...form.register("maximumScore", { valueAsNumber: true })} />{form.formState.errors.maximumScore && <p className="text-sm text-destructive" role="alert">{form.formState.errors.maximumScore.message}</p>}</div>
                <div className="space-y-2"><label htmlFor="edit-assessment-weight" className="text-sm font-medium">Weight (%)</label><Input id="edit-assessment-weight" type="number" min="0.01" max="100" step="0.01" {...form.register("weightPercent", { valueAsNumber: true })} />{form.formState.errors.weightPercent && <p className="text-sm text-destructive" role="alert">{form.formState.errors.weightPercent.message}</p>}</div>
              </div>
              <div className="space-y-2"><label htmlFor="edit-assessment-description" className="text-sm font-medium">Description <span className="text-muted-foreground">(optional)</span></label><textarea id="edit-assessment-description" rows={3} maxLength={500} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...form.register("description")} /></div>
              <div className="space-y-2">
                <label htmlFor="edit-assessment-assignment" className="text-sm font-medium">Assignment</label>
                <select id="edit-assessment-assignment" className={selectClassName} {...form.register("teacherAssignmentId")}>
                  <option value="">Choose an assignment</option>
                  {myAssignments.map((assignment) => {
                    const term = terms.find(t => t.id === assignment.termId);
                    const cls = classes.find(c => c.id === assignment.schoolClassId);
                    const sub = subjects.find(s => s.id === assignment.subjectId);
                    return (
                      <option key={assignment.id} value={assignment.id}>
                        {cls?.name || 'Unknown Class'} - {sub?.name || 'Unknown Subject'} ({term?.name || 'Unknown Term'})
                      </option>
                    );
                  })}
                </select>
                {form.formState.errors.teacherAssignmentId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.teacherAssignmentId.message}</p>}
              </div>
              <label htmlFor="edit-assessment-current-final" className="flex items-start gap-3 rounded-md border p-3 text-sm">
                <input id="edit-assessment-current-final" type="checkbox" className="mt-0.5 size-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...form.register("isCurrentFinal")} />
                <span><span className="block font-medium">Designate as current/final</span><span className="mt-1 block text-muted-foreground">One current/final assessment per term, class, and subject.</span></span>
              </label>
              {updateAssessment.isError && <p className="text-sm text-destructive" role="alert">{updateAssessment.error.message || "Unable to update assessment."}</p>}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" disabled={updateAssessment.isPending} onClick={() => {
                  reset();
                  setEditing(false);
                }}>Cancel</Button>
                <Button type="submit" disabled={updateAssessment.isPending || !form.formState.isDirty}>{updateAssessment.isPending ? "Saving..." : "Save changes"}</Button>
              </div>
            </form>
          ) : (
            <section className="rounded-lg border bg-card p-5" aria-labelledby="assessment-details-heading">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="assessment-details-heading" className="text-xl font-semibold">{assessment.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{schoolClass?.name ?? "Class unavailable"} · {subject?.name ?? "Subject unavailable"} · {term?.name ?? "Term unavailable"}</p>
                </div>
                <AssessmentStatusBadge status={assessment.status} />
              </div>
              <dl className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted-foreground">Current/final assessment</dt><dd className="mt-1 flex items-center gap-2 font-medium">{assessment.isCurrentFinal ? <><CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />Yes</> : "No"}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Results entered</dt><dd className="mt-1 font-medium">{resultsQuery.isLoading ? "Loading..." : resultsQuery.isError ? "Unavailable" : recordCount}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Created</dt><dd className="mt-1 font-medium"><time dateTime={assessment.createdAt}>{assessment.createdAt.slice(0, 10)}</time></dd></div>
                {assessment.updatedAt !== assessment.createdAt && <div><dt className="text-sm text-muted-foreground">Updated</dt><dd className="mt-1 font-medium"><time dateTime={assessment.updatedAt}>{assessment.updatedAt.slice(0, 10)}</time></dd></div>}
                {assessment.rejectedAt && <div><dt className="text-sm text-muted-foreground">Rejected</dt><dd className="mt-1 font-medium"><time dateTime={assessment.rejectedAt}>{assessment.rejectedAt.slice(0, 10)}</time></dd></div>}
              </dl>
              <div className="mt-5 border-t pt-4">
                <h3 className="text-sm font-semibold">Assessment configuration</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><dt className="text-sm text-muted-foreground">Category</dt><dd className="mt-1 font-medium">{category?.name ?? "Unavailable"}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Assessment date</dt><dd className="mt-1 font-medium">{assessment.assessmentDate ?? "Not set"}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Maximum score</dt><dd className="mt-1 font-medium">{assessment.maximumScore ?? 100}</dd></div>
                  <div><dt className="text-sm text-muted-foreground">Weight</dt><dd className="mt-1 font-medium">{assessment.weightPercent ?? 100}%</dd></div>
                  {assessment.description && <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Description</dt><dd className="mt-1">{assessment.description}</dd></div>}
                </dl>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Results entered: {resultsQuery.isLoading ? "Loading..." : resultsQuery.isError ? "Unavailable" : recordCount} · Finalized: {resultsQuery.isLoading ? "Loading..." : resultsQuery.isError ? "Unavailable" : finalizedCount}</p>
              {assessment.rejectionReason && <div className="mt-4 rounded-md border border-destructive p-3"><h3 className="text-sm font-semibold text-destructive">Rejection reason</h3><p className="mt-1 text-sm">{assessment.rejectionReason}</p></div>}

              {/* Lifecycle status panel */}
              {lifecycleStatus && (
                <div className="mt-5 rounded-md border bg-muted/40 p-4">
                  <h3 className="text-sm font-semibold">Workflow status</h3>
                  <div className="mt-2 flex items-center gap-2">
                    {lifecycleStatus === "DRAFT" && <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />Draft</span>}
                    {lifecycleStatus === "SUBMITTED" && <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300"><Send className="h-3 w-3" aria-hidden="true" />Submitted for review</span>}
                    {lifecycleStatus === "REVIEWED" && <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"><Eye className="h-3 w-3" aria-hidden="true" />Reviewed — awaiting publication</span>}
                    {lifecycleStatus === "PUBLISHED" && <span className="inline-flex items-center gap-1.5 rounded-full border border-green-300 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300"><Globe className="h-3 w-3" aria-hidden="true" />Published</span>}
                  </div>
                  {lifecycleStatus === "PUBLISHED" && <p className="mt-2 text-xs text-muted-foreground">Published assessments are visible to parents. Revert to draft to make changes.</p>}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {/* Edit – only in DRAFT lifecycle and not rejected */}
                {canManageAssessments && !rejected && (!lifecycleStatus || lifecycleStatus === "DRAFT") && (
                  <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
                )}
                {/* Teacher/Admin: submit for review */}
                {canManageAssessments && !rejected && lifecycleStatus === "DRAFT" && (
                  <Button variant="outline" onClick={() => submitAssessment.mutate(undefined, {
                    onSuccess: () => toast.success("Assessment submitted for review."),
                    onError: (err: any) => toast.error(err.message || "Unable to submit assessment."),
                  })} disabled={submitAssessment.isPending}>
                    <Send className="mr-1.5 h-4 w-4" aria-hidden="true" />{submitAssessment.isPending ? "Submitting…" : "Submit for review"}
                  </Button>
                )}
                {/* Admin: mark reviewed */}
                {canAdminLifecycle && !rejected && lifecycleStatus === "SUBMITTED" && (
                  <Button variant="outline" onClick={() => reviewAssessment.mutate(undefined, {
                    onSuccess: () => toast.success("Assessment marked as reviewed."),
                    onError: (err: any) => toast.error(err.message || "Unable to mark reviewed."),
                  })} disabled={reviewAssessment.isPending}>
                    <Eye className="mr-1.5 h-4 w-4" aria-hidden="true" />{reviewAssessment.isPending ? "Marking…" : "Mark as reviewed"}
                  </Button>
                )}
                {/* Admin: publish */}
                {canAdminLifecycle && !rejected && lifecycleStatus === "REVIEWED" && (
                  <Button onClick={() => setPublishOpen(true)} disabled={publishAssessment.isPending}>
                    <Globe className="mr-1.5 h-4 w-4" aria-hidden="true" />Publish results
                  </Button>
                )}
                {/* Admin: revert to draft
                {canAdminLifecycle && !rejected && lifecycleStatus && lifecycleStatus !== "DRAFT" && lifecycleStatus !== "PUBLISHED" && (
                  <Button variant="outline" onClick={() => revertToDraft.mutate(undefined, {
                    onSuccess: () => toast.success("Assessment reverted to draft."),
                    onError: (err: any) => toast.error(err.message || "Unable to revert to draft."),
                  })} disabled={revertToDraft.isPending}>
                    <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />{revertToDraft.isPending ? "Reverting…" : "Revert to draft"}
                  </Button>
                )}
                */}
                {/* Reject */}
                {canManageAssessments && !rejected && (!lifecycleStatus || lifecycleStatus === "DRAFT") && (
                  <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                    <XCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />Reject assessment
                  </Button>
                )}
                {rejected && <p className="text-sm text-muted-foreground">Rejected assessments are terminal and cannot be edited.</p>}
              </div>
            </section>
          )}

          <ConfirmationDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            title="Reject this assessment?"
            description="Rejection is final. This assessment cannot be edited or restored, and it will no longer be designated as current/final."
            confirmText={rejectAssessment.isPending ? "Rejecting..." : "Reject assessment"}
            onConfirm={() => rejectAssessment.mutate(undefined, {
              onSuccess: () => {
                setRejectOpen(false);
                toast.success("Assessment rejected.");
              },
              onError: (mutationError) => toast.error(mutationError.message || "Unable to reject assessment."),
            })}
            destructive
            confirmDisabled={rejectAssessment.isPending}
          />

          <ConfirmationDialog
            open={publishOpen}
            onOpenChange={setPublishOpen}
            title="Publish assessment results?"
            description="Published results are visible to parents. This action cannot be undone through normal workflow — only an administrator can revert a published assessment."
            confirmText={publishAssessment.isPending ? "Publishing..." : "Publish results"}
            onConfirm={() => publishAssessment.mutate(undefined, {
              onSuccess: () => {
                setPublishOpen(false);
                toast.success("Assessment published. Results are now visible to parents.");
              },
              onError: (mutationError) => toast.error(mutationError.message || "Unable to publish assessment."),
            })}
            confirmDisabled={publishAssessment.isPending}
          />
        </div>
      )}
    </PageShell>
  );
}
