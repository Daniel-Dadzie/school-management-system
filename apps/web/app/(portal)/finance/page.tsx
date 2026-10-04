"use client";

import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useFinanceDashboard } from '@/hooks/use-finance';
import { formatMoneyMinor } from '@/lib/format';
import { permissions } from '@/lib/authorization/permissions';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis,
  Pie, 
  PieChart
} from 'recharts';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';

export default function FinanceDashboard() {
  const query = useFinanceDashboard();
  const data = query.data;
  
  const stats = data 
    ? [
        ['Total invoiced', data.totalInvoicedMinor], 
        ['Collected', data.totalCollectedMinor], 
        ['Outstanding', data.outstandingMinor], 
        ['Overdue', data.overdueMinor]
      ] as const 
    : [];

  const debtorRiskIndex = data ? Math.min(100, Math.round((data.overdueMinor / (data.totalInvoicedMinor || 1)) * 100)) : 0;
  const riskLevel = debtorRiskIndex > 20 ? "High" : debtorRiskIndex > 10 ? "Moderate" : "Low";
  const projectedNextTerm = data ? data.totalInvoicedMinor * 1.05 : 0;

  // -- Charts Data & Config --
  const overdueChartData = data ? Object.entries(data.overdueByClass).map(([className, amount]) => ({
    className,
    amount: amount / 100
  })) : [];

  const overdueChartConfig = {
    amount: {
      label: "Overdue Amount",
      color: "hsl(0 84% 60%)",
    }
  };

  const chartColors = [
    "hsl(262 83% 58%)", 
    "hsl(220 70% 50%)", 
    "hsl(142 71% 45%)", 
    "hsl(38 92% 50%)", 
    "hsl(199 89% 48%)"
  ];
  
  const paymentMethodData = data ? Object.entries(data.paymentMethodTotals).map(([method, amount], i) => ({
    method: method.replace('_', ' '),
    amount: amount / 100,
    fill: chartColors[i % chartColors.length]
  })) : [];

  const paymentChartConfig = data ? Object.entries(data.paymentMethodTotals).reduce((acc, [method], i) => {
    acc[method.replace('_', ' ')] = {
      label: method.replace('_', ' '),
      color: chartColors[i % chartColors.length]
    };
    return acc;
  }, { amount: { label: "Amount" } } as Record<string, { label: string; color?: string }>) : {};

  // Financial Health Funnel Data (Pie)
  const funnelData = data ? [
    { name: "Collected", amount: data.totalCollectedMinor / 100, fill: "hsl(142 71% 45%)" },
    { name: "Outstanding", amount: (data.outstandingMinor - data.overdueMinor) / 100, fill: "hsl(38 92% 50%)" },
    { name: "Overdue", amount: data.overdueMinor / 100, fill: "hsl(0 84% 60%)" }
  ].filter(d => d.amount > 0) : [];

  const funnelConfig = {
    amount: { label: "Amount" },
    Collected: { label: "Collected", color: "hsl(142 71% 45%)" },
    Outstanding: { label: "Outstanding", color: "hsl(38 92% 50%)" },
    Overdue: { label: "Overdue", color: "hsl(0 84% 60%)" },
  };

  return (
    <PageShell 
      title="Finance Dashboard" 
      description="Financial health, fee collections, and revenue projections." 
      permission={permissions.financeView} 
      actions={<Button asChild><Link href="/finance/invoices/new">Create invoice</Link></Button>}
    >
      {query.isLoading ? (
        <div role="status" className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : query.isError ? (
        <ErrorState title="Unable to load finance summary" description="Refresh to try again." onRetry={() => void query.refetch()} />
      ) : !data ? (
        <EmptyState title="Finance summary unavailable" description="No finance data is available." />
      ) : (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMoneyMinor(value)}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/finance/fee-structures">Fee structures</Link></Button>
            <Button asChild variant="outline"><Link href="/finance/invoices">Invoices ({data.invoiceCount})</Link></Button>
            <Button asChild variant="outline"><Link href="/finance/payments">Payments ({data.paymentCount})</Link></Button>
            <Button asChild variant="outline"><Link href="/finance/outstanding">Outstanding balances</Link></Button>
            <Button asChild variant="outline"><Link href="/finance/reconciliation">Reconciliation</Link></Button>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Financial Health Overview</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Debtor Risk Index (DRI)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mt-2 text-3xl font-semibold text-error-text">{debtorRiskIndex}%</p>
                  <p className="text-sm text-muted-foreground">Risk level: {riskLevel}.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Projected Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mt-2 text-3xl font-semibold text-success-text">{formatMoneyMinor(projectedNextTerm)}</p>
                  <p className="text-sm text-muted-foreground">Est. 5% growth next term.</p>
                </CardContent>
              </Card>
              
              <Card className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col sm:flex-row items-center p-5">
                <div className="flex-1 w-full max-w-sm">
                  <ChartContainer config={funnelConfig} className="mx-auto aspect-square max-h-[200px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={funnelData}
                        dataKey="amount"
                        nameKey="name"
                        innerRadius={60}
                        paddingAngle={2}
                      />
                      <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" />
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="flex-1 w-full text-center sm:text-left mt-4 sm:mt-0">
                  <h3 className="font-semibold text-xl mb-1">Collection Rate: {data.collectionRate}%</h3>
                  <p className="text-sm text-muted-foreground mb-4">Total invoiced funds distributed into collected, outstanding, and overdue debt.</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {funnelData.map(d => (
                      <div key={d.name}>
                        <dt className="text-muted-foreground">{d.name}</dt>
                        <dd className="font-medium" style={{ color: d.fill }}>{formatMoneyMinor(d.amount * 100)}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Methods</CardTitle>
                <CardDescription>Revenue distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethodData.length > 0 ? (
                  <ChartContainer config={paymentChartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={paymentMethodData}
                        dataKey="amount"
                        nameKey="method"
                        labelLine={false}
                        outerRadius={80}
                        paddingAngle={2}
                      />
                      <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2" />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground p-5 text-center">No payment data available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overdue by Class</CardTitle>
                <CardDescription>Outstanding debt per classroom</CardDescription>
              </CardHeader>
              <CardContent>
                {overdueChartData.length > 0 ? (
                  <ChartContainer config={overdueChartConfig} className="mx-auto h-[250px] w-full">
                    <BarChart data={overdueChartData} margin={{ left: -10, right: 10, top: 10, bottom: 20 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="className" 
                        tickLine={false} 
                        tickMargin={10} 
                        axisLine={false} 
                        tick={{ fontSize: 12 }} 
                      />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground p-5 text-center">No overdue balances.</p>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Recent invoices</h2>
            <div className="grid gap-3">
              {data.invoices.length ? (
                data.invoices.slice(0, 5).map((row) => (
                  <Card key={row.id}>
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <strong>{row.invoiceNumber} — {row.studentName}</strong>
                        <p className="text-sm text-muted-foreground">{row.status.replace('_', ' ')} — {row.yearName} — Due {row.dueOn}</p>
                      </div>
                      <span>{formatMoneyMinor(row.outstandingMinor)} due</span>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <EmptyState 
                  title="No invoices have been issued" 
                  description="Create the first invoice to start tracking fee collection." 
                  action={<Button asChild variant="outline"><Link href="/finance/invoices/new">Issue invoice</Link></Button>} 
                />
              )}
            </div>
          </section>
        </div>
      )}
    </PageShell>
  );
}
