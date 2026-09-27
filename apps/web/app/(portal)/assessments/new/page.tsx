"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAssessmentReferences, useCreateAssessment } from "@/hooks/use-assessments";
import { permissions } from "@/lib/authorization/permissions";

const assessmentFormSchema = z.object({
  title: z.string().trim().min(2, "Enter an assessment title.").max(120, "Use 120 characters or fewer."),
  termId: z.string().min(1, "Choose a term."),
  classId: z.string().min(1, "Choose a class."),
  subjectId: z.string().min(1, "Choose a subject."),
  isCurrentFinal: z.boolean(),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

const selectClassName = "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function NewAssessment() {
  const router = useRouter();
  const references = useAssessmentReferences();
  const createAssessment = useCreateAssessment();
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: { title: "", termId: "", classId: "", subjectId: "", isCurrentFinal: false },
  });
  const terms = references.data?.terms ?? [];
  const classes = references.data?.classes ?? [];

  const onSubmit = form.handleSubmit((values) => {
    createAssessment.mutate({
      title: values.title,
      termId: values.termId,
      classId: values.classId,
      subjectId: values.subjectId,
      isCurrentFinal: values.isCurrentFinal,
    }, {
      onSuccess: (assessment) => {
        toast.success("Assessment created successfully.");
        router.push(`/assessments/${assessment.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Unable to create assessment.");
      },
    });
  });

  return (
    <PageShell
      title="New assessment"
      description="Set up an assessment for a class, subject, and term."
      breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: "New assessment" }]}
      permission={permissions.assessmentsManage}
    >
      {references.isLoading ? (
        <div className="flex min-h-48 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading academic options...</span></div>
      ) : references.isError ? (
        <div className="rounded-md border border-destructive p-6" role="alert">
          <h2 className="font-semibold text-destructive">Unable to load assessment options</h2>
          <p className="mt-1 text-sm text-muted-foreground">Refresh the page to try again.</p>
          <Button className="mt-4" variant="outline" onClick={() => void references.refetch()}>Try again</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="max-w-2xl space-y-6">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-semibold">Assessment details</h2>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label htmlFor="assessment-title" className="text-sm font-medium">Assessment title</label>
                <Input id="assessment-title" autoComplete="off" aria-invalid={Boolean(form.formState.errors.title)} {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive" role="alert">{form.formState.errors.title.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="assessment-term" className="text-sm font-medium">Term</label>
                  <select id="assessment-term" className={selectClassName} aria-invalid={Boolean(form.formState.errors.termId)} {...form.register("termId")}>
                    <option value="">Choose a term</option>
                    {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                  </select>
                  {form.formState.errors.termId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.termId.message}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="assessment-class" className="text-sm font-medium">Class</label>
                  <select id="assessment-class" className={selectClassName} aria-invalid={Boolean(form.formState.errors.classId)} {...form.register("classId")}>
                    <option value="">Choose a class</option>
                    {classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
                  </select>
                  {form.formState.errors.classId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.classId.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="assessment-subject" className="text-sm font-medium">Subject</label>
                <select id="assessment-subject" className={selectClassName} aria-invalid={Boolean(form.formState.errors.subjectId)} {...form.register("subjectId")}>
                  <option value="">Choose a subject</option>
                  {references.data?.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>)}
                </select>
                {form.formState.errors.subjectId && <p className="text-sm text-destructive" role="alert">{form.formState.errors.subjectId.message}</p>}
              </div>

              <label htmlFor="assessment-current-final" className="flex items-start gap-3 rounded-md border p-3 text-sm">
                <input id="assessment-current-final" type="checkbox" className="mt-0.5 size-4 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...form.register("isCurrentFinal")} />
                <span><span className="block font-medium">Designate as current/final</span><span className="mt-1 block text-muted-foreground">Only one current/final assessment is allowed for the selected term, class, and subject.</span></span>
              </label>
            </div>
          </div>

          {createAssessment.isError && <p className="text-sm text-destructive" role="alert">{createAssessment.error.message || "Unable to create assessment."}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" asChild><Link href="/assessments">Cancel</Link></Button>
            <Button type="submit" disabled={createAssessment.isPending}>
              {createAssessment.isPending ? "Creating..." : "Create assessment"}
            </Button>
          </div>
        </form>
      )}
    </PageShell>
  );
}
