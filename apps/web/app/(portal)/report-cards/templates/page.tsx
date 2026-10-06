"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Plus, Search, CheckCircle2, XCircle } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { useReportTemplates } from "@/hooks/use-reporting";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { AuthorizationError } from "@/lib/authorization/permissions";

export default function ReportTemplatesOverview() {
  const role = useAuthStore((state) => state.user?.role);
  const canManageTemplates = hasPermission(role, permissions.reportingManage);
  const [search, setSearch] = useState("");
  const templatesQuery = useReportTemplates();

  const visibleTemplates = useMemo(() => {
    const templates = templatesQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return templates;
    return templates.filter((template) =>
      template.name.toLowerCase().includes(query) || 
      template.description.toLowerCase().includes(query)
    );
  }, [templatesQuery.data, search]);

  const loading = templatesQuery.isLoading;
  const error = templatesQuery.error;
  const forbidden = error instanceof AuthorizationError || 
    (error as any)?.response?.status === 403;

  return (
    <PageShell
      title="Report Templates"
      description="Manage the structure and layout of student report cards."
      breadcrumbs={[{ label: "Report Cards", href: "/report-cards" }, { label: "Templates" }]}
      permission={permissions.reportingView}
      actions={canManageTemplates ? (
        <Button asChild>
          <Link href="/report-cards/templates/new"><Plus aria-hidden="true" className="mr-2 h-4 w-4" /> New template</Link>
        </Button>
      ) : undefined}
    >
      {loading ? (
        <div className="flex min-h-48 items-center justify-center" role="status">
          <LoadingSpinner />
          <span className="ml-2 text-sm text-muted-foreground">Loading templates...</span>
        </div>
      ) : forbidden ? (
        <ForbiddenState title="Access denied" />
      ) : error ? (
        <ErrorState title="Unable to load templates" description="Try refreshing the list." onRetry={() => templatesQuery.refetch()} />
      ) : !templatesQuery.data?.length ? (
        <EmptyState
          icon={FileText}
          title="No report templates yet"
          description="Create a template to configure how report cards are generated."
          action={canManageTemplates ? <Button asChild><Link href="/report-cards/templates/new">New template</Link></Button> : undefined}
        />
      ) : (
        <section aria-label="Template list" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Search templates"
              className="pl-9"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by template name or description"
            />
          </div>

          {visibleTemplates.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No matching templates"
              description="Try another search term."
              action={<Button variant="outline" onClick={() => setSearch("")}>Clear filters</Button>}
            />
          ) : (
            <ul className="grid gap-3" aria-label="Templates">
              {visibleTemplates.map((template) => (
                <li key={template.id}>
                  <Link
                    href={`/report-cards/templates/${template.id}`}
                    className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-card-foreground">{template.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {template.description || "No description provided"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {template.isActive ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="mr-1 h-3 w-3" aria-hidden="true" /> Inactive
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </PageShell>
  );
}
