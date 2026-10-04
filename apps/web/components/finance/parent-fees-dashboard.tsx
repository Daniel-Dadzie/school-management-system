"use client";

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreatePaymentPlan, useRecordFinancePayment, useStudentFees } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import type { PaymentMethod } from '@/lib/functional/types';

export function ParentFeesDashboard({ studentId }: { studentId: string }) {
  const query = useStudentFees(studentId);
  const payment = useRecordFinancePayment();
  const createPlan = useCreatePaymentPlan();
  const [paymentInvoiceId, setPaymentInvoiceId] = useState('');
  const [planInvoiceId, setPlanInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('MOBILE_MONEY');
  const [planCount, setPlanCount] = useState('3');

  if (query.isLoading) return <div role="status" className="flex justify-center p-12">Loading fee information...</div>;
  if (query.isError || !query.data) return <p className="rounded-lg border p-6 text-sm">Unable to load fee information for this child.</p>;
  const data = query.data;
  const payInvoice = data.invoices.find((invoice) => invoice.id === paymentInvoiceId);
  const planInvoice = data.invoices.find((invoice) => invoice.id === planInvoiceId);

  async function handlePayment() {
    if (!payInvoice) return;
    try {
      await payment.mutateAsync({ invoiceId: payInvoice.id, amountMinor: Math.round(Number(amount) * 100), paymentDate: new Date().toISOString().slice(0, 10), method });
      toast.success('Payment recorded and receipt generated');
      setAmount('');
      setPaymentInvoiceId('');
      setMethod('MOBILE_MONEY');
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment could not be recorded');
    }
  }

  async function handlePlan() {
    if (!planInvoice) return;
    try {
      await createPlan.mutateAsync({ invoiceId: planInvoice.id, cadence: 'MONTHLY', installmentCount: Number(planCount) });
      toast.success('Payment plan created');
      setPlanInvoiceId('');
      await query.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment plan could not be created');
    }
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{data.student.firstName} {data.student.lastName}</h2><div className="flex gap-2"><Button asChild variant="outline"><Link href={`/parent-children/${studentId}/fees/statement`}>View statement</Link></Button><Button asChild variant="outline"><Link href={`/parent-children/${studentId}`}>Back to child profile</Link></Button></div></div>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Billed', data.summary.totalBilledMinor], ['Paid', data.summary.totalPaidMinor], ['Outstanding', data.summary.outstandingMinor], ['Next due', data.summary.nextDueMinor ?? 0]].map(([label, value]) => <Card key={label as string}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{formatMoneyMinor(value as number)}</p>{label === 'Next due' && data.summary.nextDueOn && <p className="text-xs text-muted-foreground">Due {data.summary.nextDueOn}</p>}</CardContent></Card>)}</section>
    {data.invoices.length ? data.invoices.map((invoice) => <article key={invoice.id} className="space-y-3 rounded-lg border bg-card p-5"><header><h3 className="font-semibold">{invoice.invoiceNumber}</h3><p className="text-sm text-muted-foreground">{invoice.yearName} · {invoice.termName} · Due {invoice.dueOn} · {invoice.status.replace('_', ' ')}</p></header><ul className="space-y-1 text-sm">{invoice.lineItems.map((line) => <li key={line.id} className="flex justify-between gap-2"><span>{line.description}</span><span>{formatMoneyMinor(line.amountMinor)}</span></li>)}</ul>{invoice.adjustments.length > 0 && <ul className="space-y-1 border-t pt-2 text-sm text-success">{invoice.adjustments.map((adjustment) => <li key={adjustment.id} className="flex justify-between gap-2"><span>{adjustment.description}</span><span>-{formatMoneyMinor(adjustment.amountMinor)}</span></li>)}</ul>}<dl className="grid grid-cols-2 gap-2 border-t pt-3 text-sm"><div><dt className="text-muted-foreground">Total</dt><dd>{formatMoneyMinor(invoice.totalMinor)}</dd></div><div><dt className="text-muted-foreground">Outstanding</dt><dd className="font-semibold">{formatMoneyMinor(invoice.outstandingMinor)}</dd></div></dl>{invoice.outstandingMinor > 0 && <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPaymentInvoiceId(invoice.id)}>Pay now</Button><Button variant="outline" onClick={() => setPlanInvoiceId(invoice.id)}>Set payment plan</Button></div>}{paymentInvoiceId === invoice.id && <div className="grid gap-2 border-t pt-3 sm:grid-cols-[1fr_1fr_auto]"><label className="space-y-1 text-sm">Amount (in major currency units)<Input type="number" min="0.01" max={invoice.outstandingMinor / 100} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="space-y-1 text-sm">Method<select className="flex h-10 w-full rounded-md border bg-background px-3" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}><option value="MOBILE_MONEY">Mobile money</option><option value="CARD">Card</option></select></label><Button className="self-end" disabled={payment.isPending || !amount} onClick={() => void handlePayment()}>{payment.isPending ? 'Processing...' : 'Pay now'}</Button></div>}{planInvoiceId === invoice.id && <div className="grid gap-2 border-t pt-3 sm:grid-cols-[1fr_auto]"><label className="space-y-1 text-sm">Installments<select className="flex h-10 w-full rounded-md border bg-background px-3" value={planCount} onChange={(event) => setPlanCount(event.target.value)}><option value="2">2 months</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label><Button className="self-end" disabled={createPlan.isPending} onClick={() => void handlePlan()}>{createPlan.isPending ? 'Creating...' : 'Create plan'}</Button></div>}</article>) : <p className="rounded-lg border p-6 text-sm">No invoices are available for this child.</p>}
    {data.installments.length > 0 && <section className="space-y-3"><h2 className="text-lg font-semibold">Payment plan</h2>{data.installments.map((installment) => <div key={installment.id} className="flex flex-wrap justify-between gap-2 rounded-lg border bg-card p-3 text-sm"><span>Installment {installment.installmentNumber} · Due {installment.dueOn}</span><span>{formatMoneyMinor(installment.amountMinor)} · {installment.status}</span></div>)}</section>}
  </div>;
}
