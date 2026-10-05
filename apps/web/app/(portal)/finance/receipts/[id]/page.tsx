"use client";
import Link from 'next/link';
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
import { Printer, CheckCircle2, GraduationCap } from 'lucide-react';

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const query = useFinanceReceipt(id);
  const record = query.data;

  return (
    <PageShell
      title="Payment receipt"
      description="Print-friendly record of a simulated payment."
      permission={permissions.financeView}
    >
      {query.isLoading ? (
        <div role="status" className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : query.error instanceof AuthorizationError ? (
        <ForbiddenState
          title="Receipt access denied"
          description="You are not allowed to view this receipt."
          backLink="/finance"
        />
      ) : query.isError ? (
        <ErrorState
          title="Receipt is unavailable"
          description="Try refreshing this record."
          onRetry={() => void query.refetch()}
        />
      ) : !record ? (
        <EmptyState
          title="Receipt not found"
          description="This payment receipt could not be located."
          action={
            <Button asChild variant="outline">
              <Link href="/finance">Back to finance</Link>
            </Button>
          }
        />
      ) : (
        <div className="mx-auto max-w-3xl">
          {/* Action bar (Hidden on Print) */}
          <div className="mb-6 flex items-center justify-end print:hidden">
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </div>

          {/* Receipt Document */}
          <article className="relative overflow-hidden rounded-xl border bg-card shadow-sm print:shadow-none print:border-none">
            {/* PAID Watermark */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-[0.03] print:opacity-[0.05]">
              <span className="text-9xl font-black uppercase tracking-widest text-primary">PAID</span>
            </div>

            <div className="p-8 sm:p-12">
              {/* Header */}
              <div className="flex flex-col items-start justify-between gap-6 border-b pb-8 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">{record.school || "ScholaraOS"}</h1>
                    <p className="text-sm text-muted-foreground">Official School Receipt</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-3xl font-light text-foreground uppercase tracking-wider">Receipt</h2>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{record.payment.receiptNumber}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Billed To</h3>
                  <p className="font-medium text-foreground">
                    {record.student?.firstName} {record.student?.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">Student ID: {record.student?.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div className="space-y-2 sm:text-right">
                  <div className="flex justify-start sm:justify-end gap-2">
                    <span className="text-sm text-muted-foreground">Payment Date:</span>
                    <span className="text-sm font-medium">{record.payment.paymentDate}</span>
                  </div>
                  <div className="flex justify-start sm:justify-end gap-2">
                    <span className="text-sm text-muted-foreground">Invoice Ref:</span>
                    <span className="text-sm font-medium">{record.invoice.invoiceNumber}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="mt-12 overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="px-4 py-4 font-medium text-foreground">Payment towards Invoice {record.invoice.invoiceNumber}</td>
                      <td className="px-4 py-4 text-muted-foreground">{record.payment.method.replace('_', ' ')}</td>
                      <td className="px-4 py-4 text-muted-foreground">{record.payment.reference || '-'}</td>
                      <td className="px-4 py-4 text-right font-medium text-foreground">{formatMoneyMinor(record.payment.amountMinor)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="mt-6 flex justify-end">
                <div className="w-full sm:w-1/2 max-w-sm space-y-3">
                  <div className="flex items-center justify-between border-b pb-3 text-sm">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-medium text-foreground">{formatMoneyMinor(record.payment.amountMinor)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    <span className="font-medium text-muted-foreground">{formatMoneyMinor(record.invoice.outstandingMinor)}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-green-500/10 px-4 py-3 text-green-700 dark:text-green-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Payment Successful</span>
                    </div>
                    <span className="font-bold">{formatMoneyMinor(record.payment.amountMinor)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 border-t pt-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs text-muted-foreground">
                  Processed by {record.payment.recordedBy} • Simulated record only
                </p>
                <p className="text-xs font-medium text-primary">Thank you for your payment.</p>
              </div>
            </div>
          </article>
        </div>
      )}
    </PageShell>
  );
}
