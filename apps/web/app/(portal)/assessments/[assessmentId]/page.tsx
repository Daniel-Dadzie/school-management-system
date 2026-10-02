"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet } from "lucide-react";
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
import { useAssessment, useAssessmentReferences, useAssessmentResults, useRejectAssessment, useUpdateAssessment } from "@/hooks/use-assessments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";

const editSchema = z.object({
  title: z.string().trim().min(2, "Enter an assessment title.").max(120, "Use 120 characters or fewer."),
  termId: z.string().min(1, "Choose a term."),
  classId: z.string().min(1, "Choose a class."),
  subjectId: z.string().min(1, "Choose a subject."),
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
  const [editing, setEditing] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { title: "", termId: "", classId: "", subjectId: "", categoryId: "", assessmentDate: "", description: "", maximumScore: 100, weightPercent: 100, isCurrentFinal: false },
  });
  const { reset } = form;
  const terms = referencesQuery.data?.terms ?? [];
  const classes = referencesQuery.data?.classes ?? [];
  const assessment = assessmentQuery.data;
  const canManageAssessments = hasPermission(role, permissions.assessmentsManage);
  const canRecordResults = hasPermission(role, permissions.resultsManage);

  useEffect(() => {
    if (!assessment || !referencesQuery.data) return;
    reset({
      title: assessment.title,
      termId: assessment.termId,
      classId: assessment.classId,
      subjectId: assessment.subjectId,
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
      termId: values.termId,
      classId: values.classId,
      subjectId: values.subjectId,
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="edit-assessment-term" className="text-sm font-medium">Term</label>
                  <select id="edit-assessment-term" className={selectClassName} {...form.register("termId")}>
                    <option value="">Choose a term</option>
                    {terms.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                  {form.formState.errors.termId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.termId.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-assessment-class" className="text-sm font-medium">Class</label>
                  <select id="edit-assessment-class" className={selectClassName} {...form.register("classId")}>
                    <option value="">Choose a class</option>
                    {classes.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
                  </select>
                  {form.formState.errors.classId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.classId.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-assessment-subject" className="text-sm font-medium">Subject</label>
                <select id="edit-assessment-subject" className={selectClassName} {...form.register("subjectId")}>
                  <option value="">Choose a subject</option>
                  {referencesQuery.data?.subjects.map((option) => <option key={option.id} value={option.id}>{option.name} ({option.code})</option>)}
                </select>
                {form.formState.errors.subjectId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.subjectId.message}</p>}
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
              <div className="mt-5 border-t pt-4"><h3 className="text-sm font-semibold">Assessment configuration</h3><dl className="mt-3 grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted-foreground">Category</dt><dd className="mt-1 font-medium">{category?.name ?? "Unavailable"}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Assessment date</dt><dd className="mt-1 font-medium">{assessment.assessmentDate ?? "Not set"}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Maximum score</dt><dd className="mt-1 font-medium">{assessment.maximumScore ?? 100}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Weight</dt><dd className="mt-1 font-medium">{assessment.weightPercent ?? 100}%</dd></div>
                {assessment.description && <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Description</dt><dd className="mt-1">{assessment.description}</dd></div>}
              </dl></div>
              <p className="mt-4 text-sm text-muted-foreground">Results entered: {resultsQuery.isLoading ? "Loading..." : resultsQuery.isError ? "Unavailable" : recordCount} · Finalized: {resultsQuery.isLoading ? "Loading..." : resultsQuery.isError ? "Unavailable" : finalizedCount}</p>
              {assessment.rejectionReason && <div className="mt-4 rounded-md border border-destructive p-3"><h3 className="text-sm font-semibold text-destructive">Rejection reason</h3><p className="mt-1 text-sm">{assessment.rejectionReason}</p></div>}
              {canManageAssessments && <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
                {!rejected && <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>}
                {!rejected && <Button variant="destructive" onClick={() => setRejectOpen(true)}>Reject assessment</Button>}
                {rejected && <p className="text-sm text-muted-foreground">Rejected assessments are terminal and cannot be edited.</p>}
              </div>}
            </section>
          )}

          {canManageAssessments && <ConfirmationDialog
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
          />}
        </div>
      )}
    </PageShell>
  );
}
