"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, FileSpreadsheet, Plus, Search } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { AssessmentStatusBadge } from "@/components/shared/assessment-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import { useAssessmentReferences, useAssessments } from "@/hooks/use-assessments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";

export default function AssessmentsOverview() {
  const role = useAuthStore((state) => state.user?.role);
  const canManageAssessments = hasPermission(role, permissions.assessmentsManage);
  const [search, setSearch] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const assessmentsQuery = useAssessments();
  const referencesQuery = useAssessmentReferences();

  const visibleAssessments = useMemo(() => {
    const assessments = assessmentsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return assessments;
    const references = referencesQuery.data;
    return assessments.filter((assessment) => {
      const term = references?.terms.find((record) => record.id === assessment.termId)?.name ?? "";
      const schoolClass = references?.classes.find((record) => record.id === assessment.classId)?.name ?? "";
      const subject = references?.subjects.find((record) => record.id === assessment.subjectId)?.name ?? "";
      const assessmentTerm = references?.terms.find((record) => record.id === assessment.termId);
      const matchesQuery = [assessment.title, term, schoolClass, subject, assessment.status].some((value) =>
        value.toLowerCase().includes(query),
      );
      return matchesQuery && (!academicYearId || assessmentTerm?.academicYearId === academicYearId) &&
        (!termId || assessment.termId === termId) && (!classId || assessment.classId === classId) &&
        (!subjectId || assessment.subjectId === subjectId) && (!categoryId || assessment.categoryId === categoryId) &&
        (!status || assessment.status === status);
    });
  }, [assessmentsQuery.data, referencesQuery.data, search, academicYearId, termId, classId, subjectId, categoryId, status]);

  const loading = assessmentsQuery.isLoading || referencesQuery.isLoading;
  const error = assessmentsQuery.error ?? referencesQuery.error;
  const forbidden = error instanceof AssessmentDomainError && error.code === "FORBIDDEN";

  return (
    <PageShell
      title="Assessments"
      description="Create and manage assessments for each class, subject, and term."
      breadcrumbs={[{ label: "Assessments" }]}
      permission={permissions.assessmentsView}
      actions={canManageAssessments ? (
        <Button asChild>
          <Link href="/assessments/new"><Plus aria-hidden="true" /> New assessment</Link>
        </Button>
      ) : undefined}
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center" role="status">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">Loading assessments...</span>
        </div>
      ) : forbidden ? (
        <ForbiddenState title="Assessment access denied" />
      ) : error ? (
        <ErrorState title="Unable to load assessments" description="Try refreshing the list." onRetry={() => {
            void assessmentsQuery.refetch();
            void referencesQuery.refetch();
          }} />
      ) : !assessmentsQuery.data?.length ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No assessments yet"
          description="Create an assessment to begin recording student results."
          action={<Button asChild><Link href="/assessments/new">New assessment</Link></Button>}
        />
      ) : (
        <section aria-label="Assessment list" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Search assessments"
              className="pl-9"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, class, subject, or term"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">Academic year<select aria-label="Filter by academic year" className="h-9 w-full rounded-md border bg-background px-3" value={academicYearId} onChange={(event) => { setAcademicYearId(event.target.value); setTermId(""); }}><option value="">All academic years</option>{referencesQuery.data?.academicYears.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Term<select aria-label="Filter by term" className="h-9 w-full rounded-md border bg-background px-3" value={termId} onChange={(event) => setTermId(event.target.value)}><option value="">All terms</option>{referencesQuery.data?.terms.filter((term) => !academicYearId || term.academicYearId === academicYearId).map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Class<select aria-label="Filter by class" className="h-9 w-full rounded-md border bg-background px-3" value={classId} onChange={(event) => setClassId(event.target.value)}><option value="">All classes</option>{referencesQuery.data?.classes.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Subject<select aria-label="Filter by subject" className="h-9 w-full rounded-md border bg-background px-3" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">All subjects</option>{referencesQuery.data?.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Category<select aria-label="Filter by category" className="h-9 w-full rounded-md border bg-background px-3" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">All categories</option>{referencesQuery.data?.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="space-y-1 text-sm">Status<select aria-label="Filter by status" className="h-9 w-full rounded-md border bg-background px-3" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="REJECTED">Rejected</option></select></label>
          </div>

          {visibleAssessments.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching assessments"
              description="Try another search term or clear the search."
              action={<Button variant="outline" onClick={() => { setSearch(""); setAcademicYearId(""); setTermId(""); setClassId(""); setSubjectId(""); setCategoryId(""); setStatus(""); }}>Clear filters</Button>}
            />
          ) : (
            <ul className="grid gap-3" aria-label="Assessments">
              {visibleAssessments.map((assessment) => {
                const term = referencesQuery.data?.terms.find((record) => record.id === assessment.termId);
                const schoolClass = referencesQuery.data?.classes.find((record) => record.id === assessment.classId);
                const subject = referencesQuery.data?.subjects.find((record) => record.id === assessment.subjectId);
                return (
                  <li key={assessment.id}>
                    <Link
                      href={`/assessments/${assessment.id}`}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-card-foreground">{assessment.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {schoolClass?.name ?? "Class unavailable"} · {subject?.name ?? "Subject unavailable"} · {term?.name ?? "Term unavailable"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {assessment.categoryId && <Badge variant="outline">{referencesQuery.data?.categories.find((category) => category.id === assessment.categoryId)?.name ?? "Category"}</Badge>}
                        <AssessmentStatusBadge status={assessment.status} />
                        {assessment.isCurrentFinal && (
                          <Badge variant="secondary"><CheckCircle2 aria-hidden="true" /> Current/final</Badge>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </PageShell>
  );
}
