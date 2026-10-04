"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceInvoices, useFinancePayments } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { permissions } from '@/lib/authorization/permissions';

export function InvoiceList() {
  const query = useFinanceInvoices(); const [search, setSearch] = useState('');
  const rows = useMemo(() => (query.data ?? []).filter((row) => `${row.invoiceNumber} ${row.studentName} ${row.className} ${row.status}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  return <PageShell title="Invoices" description="Review charges, payments, and balances by student." permission={permissions.financeView} actions={<Button asChild><Link href="/finance/invoices/new">Create invoice</Link></Button>}>
    {query.isLoading ? <div role="status" className="flex justify-center p-12"><LoadingSpinner /></div> : query.isError ? <ErrorState title="Unable to load invoices" description="Refresh to try again." onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No invoices yet" description="Create a fee structure and issue the first student invoice." /> : !rows.length ? <p className="rounded-lg border p-6 text-sm">No invoices match that search.</p> : <section className="space-y-4"><label className="block max-w-sm space-y-1 text-sm font-medium">Search invoices<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Invoice or student" /></label><div className="grid gap-3">{rows.map((row) => <Card key={row.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-semibold">{row.invoiceNumber} · {row.studentName}</p><p className="text-sm text-muted-foreground">{row.className} · {row.yearName} · {row.termName} · Due {row.dueOn}</p><p className="mt-1 text-sm">{row.status.replace('_', ' ')} · {formatMoneyMinor(row.outstandingMinor)} outstanding</p></div><Button asChild variant="outline"><Link href={`/finance/invoices/${row.id}`}>View invoice</Link></Button></CardContent></Card>)}</div></section>}
  </PageShell>;
}

export function PaymentList() {
  const query = useFinancePayments(); const [search, setSearch] = useState('');
  const rows = (query.data ?? []).filter((row) => `${row.receiptNumber} ${row.reference} ${row.studentName} ${row.method}`.toLowerCase().includes(search.toLowerCase()));
  return <PageShell title="Payments" description="Simulated payment records entered by school administrators." permission={permissions.financeView}>
    {query.isLoading ? <div role="status" className="flex justify-center p-12"><LoadingSpinner /></div> : query.isError ? <ErrorState title="Unable to load payments" description="Refresh to try again." onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No payments recorded" description="Recorded payments will appear here." /> : <section className="space-y-4"><label className="block max-w-sm space-y-1 text-sm font-medium">Search payments<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Receipt, reference, or student" /></label>{rows.length ? <div className="grid gap-3">{rows.map((row) => <Card key={row.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{row.receiptNumber} · {row.studentName}</p><p className="text-sm text-muted-foreground">{row.reference} · {row.invoiceNumber} · {row.method.replace('_', ' ')} · {row.paymentDate}</p></div><div className="flex items-center gap-3"><strong>{formatMoneyMinor(row.amountMinor)}</strong><Button asChild variant="outline"><Link href={`/finance/receipts/${row.id}`}>Receipt</Link></Button></div></CardContent></Card>)}</div> : <p className="rounded-lg border p-6 text-sm">No payments match that search.</p>}</section>}
  </PageShell>;
}
