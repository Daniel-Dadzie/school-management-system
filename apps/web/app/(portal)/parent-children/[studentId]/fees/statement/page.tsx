"use client";

import { useParams } from 'next/navigation';
import PageShell from '@/components/layout/page-shell';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceStatement } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { permissions } from '@/lib/authorization/permissions';

export default function ParentFeeStatementPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const query = useFinanceStatement(studentId);
  return <PageShell title="Fee statement" description="A complete record of charges, adjustments, and payments." permission={permissions.parentFeesView}>
    {query.isLoading ? <div role="status" className="flex justify-center p-12"><LoadingSpinner /></div> : query.isError || !query.data ? <ErrorState title="Unable to load statement" description="Refresh to try again." onRetry={() => void query.refetch()} /> : <article className="space-y-5 rounded-lg border bg-card p-5 print:border-0"><header><h2 className="text-xl font-semibold">{query.data.student.firstName} {query.data.student.lastName}</h2><p className="text-sm text-muted-foreground">Fee account statement</p></header><div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-sm"><thead><tr className="border-b text-left"><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2 text-right">Amount</th></tr></thead><tbody>{query.data.entries.map((entry, index) => <tr key={`${entry.date}-${entry.description}-${index}`} className="border-b"><td className="p-2">{entry.date}</td><td className="p-2">{entry.description}</td><td className={`p-2 text-right ${entry.amountMinor < 0 ? 'text-success' : ''}`}>{entry.amountMinor < 0 ? '-' : ''}{formatMoneyMinor(Math.abs(entry.amountMinor))}</td></tr>)}</tbody></table></div><div className="flex justify-end border-t pt-4 font-semibold">Balance: {formatMoneyMinor(query.data.balanceMinor)}</div></article>}
  </PageShell>;
}
