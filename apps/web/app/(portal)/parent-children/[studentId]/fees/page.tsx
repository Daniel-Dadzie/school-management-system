"use client";

import { useParams } from 'next/navigation';
import PageShell from '@/components/layout/page-shell';
import { ParentFeesDashboard } from '@/components/finance/parent-fees-dashboard';
import { permissions } from '@/lib/authorization/permissions';

export default function ParentFeesPage() {
  const { studentId } = useParams<{ studentId: string }>();
  return (
    <PageShell title="Fees and payments" description="Review balances, payment plans, and simulated payments for your child." permission={permissions.parentFeesView}>
      <ParentFeesDashboard studentId={studentId} />
    </PageShell>
  );
}
