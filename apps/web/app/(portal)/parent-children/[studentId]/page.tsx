"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { AcademicHistory } from "@/components/shared/academic-history";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { useParentChildren } from "@/hooks/use-parent-children";
import { permissions } from "@/lib/authorization/permissions";

export default function ParentChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const children = useParentChildren();
  const child = children.data?.find((student) => student.id === studentId);

  return <PageShell title="Child profile" breadcrumbs={[{ label: "My children", href: "/parent-children" }, { label: "Academic history" }]} permission={permissions.parentChildrenView}>
    {children.isLoading ? <div className="flex min-h-40 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2">Loading child profile...</span></div>
      : children.isError ? <ErrorState title="Unable to load child profile" description="Refresh the page and try again." onRetry={() => void children.refetch()} />
        : !child ? <EmptyState title="Child profile unavailable" description="This student is not linked to your account." action={<Button asChild variant="outline"><Link href="/parent-children">Back to my children</Link></Button>} />
          : <div className="space-y-4"><section aria-labelledby="child-heading" className="rounded-md border bg-card p-4"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h2 id="child-heading" className="text-lg font-semibold">{[child.firstName, child.middleName, child.lastName].filter(Boolean).join(" ")}</h2><p className="mt-1 text-sm text-muted-foreground">Student academic progression and enrollment history</p>
  </div>
  <Button asChild>
    <Link href={`/parent-children/${child.id}/report-card`}>View Report Card</Link>
  </Button>
</div></section><AcademicHistory studentId={child.id} /></div>}
  </PageShell>;
}
