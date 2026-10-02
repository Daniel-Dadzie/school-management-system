"use client";

import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { AuthorizationError, permissions } from "@/lib/authorization/permissions";
import { useParentChildren } from "@/hooks/use-parent-children";
import { Users } from "lucide-react";
import Link from "next/link";

export default function ParentChildrenPage() {
  return (
    <PageShell title="My Children" breadcrumbs={[{ label: "My Children" }]} permission={permissions.parentChildrenView}>
      <ParentChildrenList />
    </PageShell>
  );
}

function ParentChildrenList() {
  const childrenQuery = useParentChildren();

  if (childrenQuery.isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center" role="status">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted-foreground">Loading linked children...</span>
      </div>
    );
  }

  if (childrenQuery.error instanceof AuthorizationError) {
    return <ForbiddenState title="Parent access denied" />;
  }

  if (childrenQuery.isError) {
    return (
      <ErrorState
        title="Unable to load linked children"
        description="Try refreshing the list."
        onRetry={() => void childrenQuery.refetch()}
      />
    );
  }

  if (!childrenQuery.data?.length) {
    return (
      <EmptyState
        title="No children linked"
        description="No children are currently linked to your account."
        icon={Users}
      />
    );
  }

  return (
    <ul aria-label="Linked children" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {childrenQuery.data.map((student) => (
        <li key={student.id}>
          <Card className="h-full">
            <CardHeader>
            <CardTitle><Link className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={`/parent-children/${student.id}`}>{student.firstName} {student.lastName}</Link></CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Linked child</CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
