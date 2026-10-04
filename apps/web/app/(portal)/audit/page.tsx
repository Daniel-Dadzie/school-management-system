"use client";

import { useMemo, useState } from "react";
import { FileClock, Search } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { permissions } from "@/lib/authorization/permissions";
import { useAuditEvents } from "@/hooks/use-audit";
import type { AuditEventRecord } from "@/lib/functional/types";

const actions: Array<AuditEventRecord['action'] | 'ALL'> = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

const formatDateTime = (value: string) => new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<AuditEventRecord['action'] | 'ALL'>('ALL');
  const eventsQuery = useAuditEvents({ search, action });
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const entityTypes = useMemo(() => Array.from(new Set(events.map((event) => event.entityType))).sort(), [events]);
  const [entityType, setEntityType] = useState('');
  const filteredEvents = entityType ? events.filter((event) => event.entityType === entityType) : events;

  return (
    <PageShell
      title="Audit logs"
      description="Review sensitive activity recorded in the school portal."
      breadcrumbs={[{ label: "Administration" }, { label: "Audit logs" }]}
      permission={permissions.systemManage}
    >
      <section className="space-y-4">
        <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_12rem_14rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label="Search audit logs" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, action, or record" />
          </div>
          <select aria-label="Filter by action" className="h-10 rounded-md border bg-background px-3 text-sm" value={action} onChange={(event) => setAction(event.target.value as AuditEventRecord['action'] | 'ALL')}>
            {actions.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All actions' : item}</option>)}
          </select>
          <select aria-label="Filter by record type" className="h-10 rounded-md border bg-background px-3 text-sm" value={entityType} onChange={(event) => setEntityType(event.target.value)}>
            <option value="">All record types</option>
            {entityTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {eventsQuery.isLoading ? (
          <div role="status" className="flex min-h-48 items-center justify-center rounded-lg border bg-card"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading audit logs...</span></div>
        ) : eventsQuery.isError ? (
          <ErrorState title="Unable to load audit logs" description="Refresh to try loading the activity history." onRetry={() => { void eventsQuery.refetch(); }} />
        ) : !filteredEvents.length ? (
          <EmptyState icon={FileClock} title="No audit activity found" description={search || action !== 'ALL' || entityType ? "Try changing the filters." : "Sensitive portal activity will appear here."} />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full min-w-2xl text-sm">
              <thead className="border-b bg-muted text-left text-muted-foreground">
                <tr><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Action</th><th className="px-4 py-3 font-medium">Record</th><th className="px-4 py-3 font-medium">Details</th></tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(event.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{event.userName}</td>
                    <td className="px-4 py-3">{event.action}</td>
                    <td className="px-4 py-3">{event.entityType}</td>
                    <td className="max-w-sm truncate px-4 py-3 text-muted-foreground">{event.details || 'No additional details'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
