"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssessmentAdapter } from "@/lib/functional/adapters/assessment-adapter";
import { useAssessmentReferences, useAssessments, useAssessmentRoster } from "@/hooks/use-assessments";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import { AssessmentResultInput } from "@/lib/functional/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { FileSpreadsheet, Search } from "lucide-react";

export function ResultsWorkspace() {
  const client = useQueryClient();
  const references = useAssessmentReferences();
  const assessmentsQuery = useAssessments();
  const [yearId, setYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const years = references.data?.academicYears ?? [];
  const year = yearId || years[0]?.id || "";
  const terms = references.data?.terms.filter((term) => term.academicYearId === year) ?? [];
  const term = terms.some((item) => item.id === termId) ? termId : terms[0]?.id ?? "";
  const classes = references.data?.classes.filter((item) => !('academicYearId' in item) || typeof item.academicYearId !== 'string' || item.academicYearId === year) ?? [];
  const schoolClass = classes.some((item) => item.id === classId) ? classId : classes[0]?.id ?? "";
  const subjects = references.data?.subjects ?? [];
  const assessments = (assessmentsQuery.data ?? []).filter((item) => item.termId === term && item.classId === schoolClass && item.status !== "REJECTED" && (!subjectId || item.subjectId === subjectId));
  const teacherAssignmentId = assessments.length > 0 ? assessments[0].teacherAssignmentId : "";
  const rosterQuery = useAssessmentRoster(teacherAssignmentId);
  const resultQuery = useQuery({
    queryKey: ["results-workspace", assessments.map((item) => item.id).join("|")],
    enabled: assessments.length > 0,
    queryFn: async () => Object.fromEntries(await Promise.all(assessments.map(async (assessment) => [assessment.id, await AssessmentAdapter.getAssessmentResults(assessment.id)] as const))),
  });
  const save = useMutation({
    mutationFn: async (entries: Array<{ assessmentId: string; inputs: AssessmentResultInput[] }>) => Promise.all(entries.map(({ assessmentId, inputs }) => AssessmentAdapter.saveAssessmentResults(assessmentId, inputs))),
    onSuccess: () => Promise.all([client.invalidateQueries({ queryKey: ["results-workspace"] }), client.invalidateQueries({ queryKey: ["assessments"] }), client.invalidateQueries({ queryKey: ["student-results"] })]),
  });
  const roster = (rosterQuery.data ?? []).filter(({ student }) => `${student.firstName} ${student.lastName} ${student.admissionNumber ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const loading = references.isLoading || assessmentsQuery.isLoading || rosterQuery.isLoading || (assessments.length > 0 && resultQuery.isLoading);
  const error = references.error ?? assessmentsQuery.error ?? rosterQuery.error ?? resultQuery.error;
  const forbidden = error instanceof AssessmentDomainError && error.code === "FORBIDDEN";
  const resultRows = resultQuery.data ?? {};
  const inputValue = (assessmentId: string, enrollmentId: string) => drafts[`${assessmentId}:${enrollmentId}`] ?? String(resultRows[assessmentId]?.find((result) => result.enrollmentId === enrollmentId)?.score ?? "");
  const onSave = () => {
    const entries = assessments.filter((assessment) => assessment.status !== "REJECTED").map((assessment) => ({
      assessmentId: assessment.id,
      inputs: (rosterQuery.data ?? []).map(({ enrollmentId, student }) => {
        if (resultRows[assessment.id]?.some((result) => result.enrollmentId === enrollmentId && result.status === "FINALIZED")) return { enrollmentId, studentId: student.id, score: null };
        const value = inputValue(assessment.id, enrollmentId).trim();
        return { enrollmentId, studentId: student.id, score: value ? Number(value) : null };
      }),
    })).filter(({ inputs }) => inputs.some((input) => input.score !== null));
    if (entries.length) save.mutate(entries, { onSuccess: () => { setDrafts({}); }, });
  };

  if (loading) return <div role="status" className="flex min-h-48 items-center justify-center"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading gradebook...</span></div>;
  if (forbidden) return <ForbiddenState title="Results access denied" />;
  if (error) return <ErrorState title="Unable to load gradebook" description="Try again to load the academic results." onRetry={() => { void references.refetch(); void assessmentsQuery.refetch(); void rosterQuery.refetch(); void resultQuery.refetch(); }} />;

  return <section className="space-y-4">
    <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
      <label className="space-y-1 text-sm">Academic year<select className="h-9 w-full rounded-md border bg-background px-3" value={year} onChange={(event) => { setYearId(event.target.value); setTermId(""); setClassId(""); }}><option value="">Choose year</option>{years.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-1 text-sm">Term<select className="h-9 w-full rounded-md border bg-background px-3" value={term} onChange={(event) => setTermId(event.target.value)}><option value="">Choose term</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-1 text-sm">Class<select className="h-9 w-full rounded-md border bg-background px-3" value={schoolClass} onChange={(event) => setClassId(event.target.value)}><option value="">Choose class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="space-y-1 text-sm">Subject<select className="h-9 w-full rounded-md border bg-background px-3" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">All subjects</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <div className="relative sm:col-span-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label="Search students" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" /></div>
    </div>
    {!schoolClass || !term ? <EmptyState icon={FileSpreadsheet} title="Choose an academic context" description="Select an academic year, term, and class to open the gradebook." /> : !assessments.length ? <EmptyState icon={FileSpreadsheet} title="No assessments for this selection" description="Create an assessment for the selected term, class, and subject." /> : !rosterQuery.data?.length ? <EmptyState icon={FileSpreadsheet} title="No active enrollments" description="No active students are enrolled in this class for the selected year." /> : !roster.length ? <EmptyState icon={Search} title="No matching students" description="Clear the search to show the active class roster." action={<Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>} /> : <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Blank cells are missing results. Raw scores and derived grades are shown together; each assessment enforces its own maximum score.</p><Button onClick={onSave} disabled={save.isPending || !assessments.some((assessment) => roster.some(({ enrollmentId }) => drafts[`${assessment.id}:${enrollmentId}`]?.trim()))}>{save.isPending ? "Saving scores…" : "Save score changes"}</Button></div>
      {save.isError && <p role="alert" className="text-sm text-destructive">{save.error.message}</p>}
      <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full min-w-[760px] text-sm"><thead className="bg-muted/50 text-left"><tr><th className="sticky left-0 z-10 bg-muted/50 px-3 py-3">Student</th>{assessments.map((assessment) => <th key={assessment.id} className="min-w-44 px-3 py-3 align-top"><Link className="font-medium underline-offset-4 hover:underline" href={`/assessments/${assessment.id}/results`}>{assessment.title}</Link><span className="mt-1 block text-xs font-normal text-muted-foreground">Max {assessment.maximumScore ?? 100} · {assessment.weightPercent ?? 100}%</span></th>)}</tr></thead><tbody>{roster.map(({ enrollmentId, student }) => <tr key={enrollmentId} className="border-t align-top"><th scope="row" className="sticky left-0 z-10 bg-card px-3 py-3 text-left"><Link href={`/results/${student.id}`} className="font-medium underline-offset-4 hover:underline">{student.firstName} {student.lastName}</Link><span className="mt-1 block text-xs font-normal text-muted-foreground">{student.admissionNumber ?? "Student"}</span></th>{assessments.map((assessment) => {
        const saved = resultRows[assessment.id]?.find((result) => result.enrollmentId === enrollmentId);
        const key = `${assessment.id}:${enrollmentId}`;
        const entered = inputValue(assessment.id, enrollmentId);
        const derived = saved?.grade ? `${saved.grade} · ${saved.percentage?.toFixed(2) ?? ""}%` : "";
        return <td key={assessment.id} className="px-3 py-2"><Input aria-label={`${student.firstName} ${student.lastName}, ${assessment.title} raw score`} type="number" min="0" max={assessment.maximumScore ?? 100} step="0.01" value={entered} disabled={assessment.status === "REJECTED" || saved?.status === "FINALIZED" || save.isPending} onChange={(event) => setDrafts((current) => ({ ...current, [key]: event.target.value }))} /><span className="mt-1 block text-xs text-muted-foreground">{saved?.status === "FINALIZED" ? "Finalized" : saved ? `Entered${derived ? ` · ${derived}` : ""}` : entered.trim() ? "Unsaved" : "Not entered"}</span></td>;
      })}</tr>)}</tbody></table></div>
    </>}
  </section>;
}
