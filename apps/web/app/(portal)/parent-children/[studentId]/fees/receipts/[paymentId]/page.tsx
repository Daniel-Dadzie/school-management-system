"use client";
import { useParams } from 'next/navigation';
import PageShell from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { ForbiddenState } from '@/components/ui/forbidden-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceReceipt } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { AuthorizationError, permissions } from '@/lib/authorization/permissions';

export default function ParentReceiptPage() { const { studentId, paymentId } = useParams<{ studentId: string; paymentId: string }>(); const query = useFinanceReceipt(paymentId); const value = query.data;
  if (query.isLoading) return <PageShell title="Payment receipt" description="A simulated payment record for your child." permission={permissions.parentFeesView}><div role="status" className="flex justify-center p-12"><LoadingSpinner /></div></PageShell>;
  if (query.error instanceof AuthorizationError) return <PageShell title="Payment receipt" description="A simulated payment record for your child." permission={permissions.parentFeesView}><ForbiddenState title="Receipt access denied" description="This payment receipt is not available to your account." backLink={`/parent-children/${studentId}/fees`} /></PageShell>;
  if (query.isError || !value) return <PageShell title="Payment receipt" description="A simulated payment record for your child." permission={permissions.parentFeesView}><ErrorState title="Receipt not found" description="This receipt is unavailable or not linked to this account." onRetry={() => void query.refetch()} /></PageShell>;
  return <PageShell title="Payment receipt" description="A simulated payment record for your child." permission={permissions.parentFeesView}><article className="mx-auto max-w-xl space-y-4 rounded-lg border bg-card p-6 print:border-0"><h2 className="text-xl font-semibold">{value.school}</h2><p>{value.payment.receiptNumber} · {value.payment.paymentDate}</p><p>{value.student?.firstName} {value.student?.lastName} · {value.invoice.invoiceNumber}</p><p>{value.payment.method.replace('_', ' ')} · {value.payment.reference}</p><p className="text-lg font-semibold">Received {formatMoneyMinor(value.payment.amountMinor)}</p><p>Remaining balance {formatMoneyMinor(value.invoice.outstandingMinor)}</p><p className="rounded-md border p-3 text-sm">Simulated record only. No funds were transferred.</p><Button className="print:hidden" onClick={() => window.print()}>Print receipt</Button></article></PageShell>;
}
