"use client";
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import PageShell from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { ForbiddenState } from '@/components/ui/forbidden-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceInvoices, useFinancePayments, useRecordFinancePayment } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { AuthorizationError, permissions } from '@/lib/authorization/permissions';
import type { PaymentMethod } from '@/lib/functional/types';

export default function InvoiceDetailPage() { const { id } = useParams<{ id: string }>(); const query = useFinanceInvoices(); const payment = useRecordFinancePayment(); const invoice = query.data?.find((row) => row.id === id); const [amount, setAmount] = useState(''); const [method, setMethod] = useState<PaymentMethod>('CASH'); const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10)); const [notes, setNotes] = useState(''); const [error, setError] = useState('');
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(''); try { await payment.mutateAsync({ invoiceId: id, amountMinor: Math.round(Number(amount) * 100), paymentDate, method, notes }); setAmount(''); setNotes(''); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not record payment.'); } }
  return <PageShell title={invoice ? invoice.invoiceNumber : 'Invoice'} description="Invoice details and payment history." permission={permissions.financeView}>
    {query.isLoading ? <div role="status" className="flex justify-center p-12"><LoadingSpinner /></div> : query.error instanceof AuthorizationError ? <ForbiddenState title="Invoice access denied" description="You are not allowed to view this invoice." backLink="/finance" /> : query.isError ? <ErrorState title="Unable to load invoice" description="Refresh to try again." onRetry={() => void query.refetch()} /> : !invoice ? <EmptyState title="Invoice not found" description="This invoice record could not be loaded." action={<Button asChild variant="outline"><Link href="/finance/invoices">Back to invoices</Link></Button>} /> : <div className="grid gap-6 xl:grid-cols-[1fr_22rem]"><div className="space-y-5 rounded-lg border bg-card p-5"><div><h2 className="text-lg font-semibold">{invoice.studentName}</h2><p className="text-sm text-muted-foreground">{invoice.className} · {invoice.yearName} · {invoice.termName}</p><p className="mt-2 text-sm">Status: <strong>{invoice.status.replace('_', ' ')}</strong> · Issued {invoice.issuedOn} · Due {invoice.dueOn}</p></div><ul className="space-y-2 border-y py-4">{invoice.lineItems.map((line) => <li key={line.id} className="flex justify-between gap-3 text-sm"><span>{line.description}</span><span>{formatMoneyMinor(line.amountMinor)}</span></li>)}</ul><dl className="grid grid-cols-2 gap-2 text-sm"><dt>Invoice total</dt><dd className="text-right font-semibold">{formatMoneyMinor(invoice.totalMinor)}</dd><dt>Paid</dt><dd className="text-right">{formatMoneyMinor(invoice.paidMinor)}</dd><dt>Outstanding</dt><dd className="text-right font-semibold">{formatMoneyMinor(invoice.outstandingMinor)}</dd></dl><h3 className="font-semibold">Payment history</h3>{query.data && <div className="space-y-2">{/* Payment list is linked by invoice from the mock finance query. */}<PaymentsForInvoice invoiceId={id} /></div>}</div><form onSubmit={submit} className="h-fit space-y-4 rounded-lg border bg-card p-5"><h2 className="font-semibold">Record simulated payment</h2><p className="text-sm text-muted-foreground">No money is transferred. This records a payment entry only.</p><p className="text-sm">Outstanding: <strong>{formatMoneyMinor(invoice.outstandingMinor)}</strong></p><label className="block space-y-1 text-sm">Amount (GHS)<Input type="number" min="0.01" step="0.01" max={invoice.outstandingMinor / 100} required disabled={invoice.outstandingMinor === 0 || invoice.status === 'VOID'} value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label className="block space-y-1 text-sm">Method<select className="h-9 w-full rounded-md border bg-background px-3" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="MOBILE_MONEY">Mobile money</option><option value="CARD">Card</option></select></label><label className="block space-y-1 text-sm">Payment date<Input type="date" required value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></label><label className="block space-y-1 text-sm">Notes (optional)<Input maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>{amount && <p className="text-sm">Remaining after payment: {formatMoneyMinor(Math.max(0, invoice.outstandingMinor - Math.round(Number(amount) * 100)))}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={payment.isPending || !amount || invoice.outstandingMinor === 0 || invoice.status === 'VOID'}>{payment.isPending ? 'Recording...' : 'Record payment'}</Button></form><div className="xl:col-span-2"><Button asChild variant="outline"><Link href="/finance/invoices">Back to invoices</Link></Button></div></div>}
  </PageShell>;
}

function PaymentsForInvoice({ invoiceId }: { invoiceId: string }) {
  const payments = useFinancePayments();
  const rows = payments.data?.filter((p) => p.invoiceId === invoiceId) ?? [];
  return rows.length ? (
    <ul className="divide-y">
      {rows.map((p) => (
        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <span>{p.paymentDate} · {p.reference} · {p.method.replace('_', ' ')}</span>
          <span>
            {formatMoneyMinor(p.amountMinor)}
            <Button asChild variant="link" size="sm">
              <Link href={`/finance/receipts/${p.id}`}>Receipt</Link>
            </Button>
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">No payments recorded.</p>
  );
}
