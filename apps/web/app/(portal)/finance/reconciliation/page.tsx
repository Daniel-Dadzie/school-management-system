"use client";

import { useState } from 'react';
import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinanceDashboard, useReconcileFinance } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { permissions } from '@/lib/authorization/permissions';
import type { PaymentMethod } from '@/lib/functional/types';
import { toast } from 'sonner';

const methods: PaymentMethod[] = ['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD'];

export default function FinanceReconciliationPage() {
  const dashboard = useFinanceDashboard();
  const reconcile = useReconcileFinance();
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recorded, setRecorded] = useState('');
  const expected = dashboard.data?.reconciliation.expected[method] ?? 0;

  async function submit() {
    try {
      await reconcile.mutateAsync({ reconciliationDate: date, method, recordedMinor: Math.round(Number(recorded) * 100) });
      toast.success('Payment method reconciled');
      setRecorded('');
      await dashboard.refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Reconciliation failed');
    }
  }

  return <PageShell title="Payment reconciliation" description="Compare recorded payments by method and date." permission={permissions.financeManage}>
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{methods.map((item) => <div key={item} className="rounded-lg border bg-card p-4"><p className="text-sm text-muted-foreground">{item.replace('_', ' ')}</p><p className="mt-1 text-xl font-semibold">{formatMoneyMinor(dashboard.data?.reconciliation.expected[item] ?? 0)}</p></div>)}</section>
      <section className="max-w-xl space-y-4 rounded-lg border bg-card p-5"><h2 className="font-semibold">Reconcile a payment method</h2><div className="grid gap-3 sm:grid-cols-3"><label className="space-y-1 text-sm">Date<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label className="space-y-1 text-sm">Method<select className="flex h-10 w-full rounded-md border bg-background px-3" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{methods.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></label><label className="space-y-1 text-sm">Counted amount<Input type="number" min="0" step="0.01" value={recorded} onChange={(event) => setRecorded(event.target.value)} /></label></div><p className="text-sm text-muted-foreground">Recorded total for this method: {formatMoneyMinor(expected)}</p><Button disabled={reconcile.isPending || !recorded} onClick={() => void submit()}>{reconcile.isPending ? 'Saving...' : 'Reconcile payment method'}</Button></section>
    </div>
  </PageShell>;
}
