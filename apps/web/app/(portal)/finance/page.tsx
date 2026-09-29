"use client";
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceDashboard } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { permissions } from '@/lib/authorization/permissions';

export default function FinanceDashboard() { const query = useFinanceDashboard(); const data = query.data; const stats = data ? [['Total invoiced', data.totalInvoicedMinor], ['Collected', data.totalCollectedMinor], ['Outstanding', data.outstandingMinor], ['Overdue', data.overdueMinor]] as const : [];
  return <PageShell title="Finance" description="School fee activity and balances. Payments recorded here are simulated; no money is transferred." permission={permissions.financeView} actions={<Button asChild><Link href="/finance/invoices/new">Create invoice</Link></Button>}>
    {query.isLoading ? <div role="status" className="flex justify-center p-12"><LoadingSpinner /></div> : query.isError ? <ErrorState title="Unable to load finance summary" description="Refresh to try again." onRetry={() => void query.refetch()} /> : <div className="space-y-6"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <Card key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{formatMoneyMinor(value)}</p></CardContent></Card>)}</section><section className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link href="/finance/fee-structures">Fee structures</Link></Button><Button asChild variant="outline"><Link href="/finance/invoices">Invoices ({data?.invoiceCount ?? 0})</Link></Button><Button asChild variant="outline"><Link href="/finance/payments">Payments ({data?.paymentCount ?? 0})</Link></Button><Button asChild variant="outline"><Link href="/finance/outstanding">Outstanding balances</Link></Button></section><h2 className="text-lg font-semibold">Recent invoices</h2><div className="grid gap-3">{data?.invoices.length ? data.invoices.slice(0, 5).map((row) => <Card key={row.id}><CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong>{row.invoiceNumber} · {row.studentName}</strong><p className="text-sm text-muted-foreground">{row.status.replace('_', ' ')} · {row.yearName} · Due {row.dueOn}</p></div><span>{formatMoneyMinor(row.outstandingMinor)} due</span></CardContent></Card>) : <EmptyState title="No invoices have been issued" description="Create the first invoice to start tracking fee collection." action={<Button asChild variant="outline"><Link href="/finance/invoices/new">Issue invoice</Link></Button>} />}</div></div>}
  </PageShell>;
}
