"use client";
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { InvoiceList } from '@/components/finance/finance-list';
export default function OutstandingPage() { return <div className="space-y-5"><InvoiceList /><div className="px-2"><Button asChild variant="outline"><Link href="/finance">Back to finance</Link></Button><p className="mt-2 text-sm text-muted-foreground">Outstanding amounts are derived from recorded payments. Paid and void invoices are excluded from the dashboard balance totals.</p></div></div>; }
