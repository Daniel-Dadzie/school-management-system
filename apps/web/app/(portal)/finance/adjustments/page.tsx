"use client";

import { useState } from 'react';
import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorState } from '@/components/ui/error-state';
import { useAddFeeAdjustment, useFinanceInvoices } from '@/hooks/use-finance';
import { permissions } from '@/lib/authorization/permissions';
import type { FeeAdjustmentType } from '@/lib/functional/types';
import { toast } from 'sonner';

const types: FeeAdjustmentType[] = ['DISCOUNT', 'SCHOLARSHIP', 'WAIVER', 'CREDIT'];

export default function FinanceAdjustmentsPage() {
  const invoices = useFinanceInvoices();
  const adjustment = useAddFeeAdjustment();
  const [invoiceId, setInvoiceId] = useState('');
  const [type, setType] = useState<FeeAdjustmentType>('DISCOUNT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await adjustment.mutateAsync({ invoiceId, type, amountMinor: Math.round(Number(amount) * 100), description });
      toast.success('Fee adjustment applied');
      setAmount('');
      setDescription('');
      setInvoiceId('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Adjustment could not be applied');
    }
  }

  return <PageShell title="Fee adjustments" description="Apply mock discounts, scholarships, waivers, or credits to an invoice." permission={permissions.financeManage}>
    {invoices.isLoading ? <div className="flex justify-center p-12"><LoadingSpinner /></div> : invoices.isError ? <ErrorState title="Unable to load invoices" description="Refresh to try again." onRetry={() => void invoices.refetch()} /> : <form onSubmit={submit} className="max-w-xl space-y-4 rounded-lg border bg-card p-5"><label className="space-y-1 text-sm">Invoice<select className="flex h-10 w-full rounded-md border bg-background px-3" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}><option value="">Select an invoice</option>{invoices.data?.filter((invoice) => invoice.status !== 'VOID' && invoice.outstandingMinor > 0).map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} · {invoice.studentName} · {invoice.outstandingMinor / 100}</option>)}</select></label><label className="space-y-1 text-sm">Adjustment type<select className="flex h-10 w-full rounded-md border bg-background px-3" value={type} onChange={(event) => setType(event.target.value as FeeAdjustmentType)}>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="space-y-1 text-sm">Amount<Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="space-y-1 text-sm">Description<Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Sibling discount" /></label><Button disabled={adjustment.isPending || !invoiceId || !amount || !description.trim()}>{adjustment.isPending ? 'Saving...' : 'Apply adjustment'}</Button></form>}
  </PageShell>;
}
