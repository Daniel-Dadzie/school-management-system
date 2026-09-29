"use client";

import { useAcademicHistory } from "@/hooks/use-promotions";
import { CircleAlert, CircleCheck, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { AuthorizationError } from "@/lib/authorization/permissions";
import { isMockMode } from "@/lib/functional/config";

export function AcademicHistory({ studentId }: { studentId: string }) {
  const query = useAcademicHistory(studentId);
  if (!isMockMode) return <p className="text-sm text-muted-foreground">Academic history is currently available in Functional Mock Mode only.</p>;
  if (query.isLoading) return <div className="flex min-h-24 items-center justify-center" role="status"><LoadingSpinner /><span className="ml-2 text-sm">Loading academic history...</span></div>;
  if (query.error instanceof AuthorizationError) return <p role="alert" className="text-sm text-destructive">You do not have access to this student’s academic history.</p>;
  if (query.isError) return <ErrorState title="Unable to load academic history" description="Refresh the page and try again." onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <EmptyState icon={History} title="No academic history yet" description="Enrollment records will appear here as the student joins academic years." />;

  return <Card><CardHeader><CardTitle>Academic history</CardTitle></CardHeader><CardContent><ol className="space-y-0" aria-label="Academic progression history">{query.data.map((entry, index) => { const StatusIcon = entry.status === "ACTIVE" ? CircleCheck : CircleAlert; return <li key={entry.enrollmentId} className="relative grid grid-cols-[1rem_1fr] gap-x-3 pb-6 last:pb-0"><span className="relative flex justify-center"><span className="mt-1.5 size-2.5 rounded-full bg-primary" aria-hidden="true" />{index < (query.data?.length ?? 0) - 1 && <span className="absolute top-4 h-full w-px bg-border" aria-hidden="true" />}</span><div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">{entry.academicYearName}</h3><span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><StatusIcon size={16} aria-hidden="true" />{entry.status.toLowerCase()}</span></div><p className="text-sm text-muted-foreground">{entry.className}{entry.decision ? ` · ${entry.decision === "PROMOTE" ? "Promoted" : "Retained"}` : ""}</p>{entry.notes && <p className="mt-1 text-sm">Decision note: {entry.notes}</p>}</div></li>; })}</ol></CardContent></Card>;
}
