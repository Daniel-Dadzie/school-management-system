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
      return [assessment.title, term, schoolClass, subject, assessment.status].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [assessmentsQuery.data, referencesQuery.data, search]);

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

          {visibleAssessments.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching assessments"
              description="Try another search term or clear the search."
              action={<Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>}
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
