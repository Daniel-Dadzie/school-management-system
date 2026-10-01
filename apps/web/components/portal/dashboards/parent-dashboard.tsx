"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardAdapter } from "@/lib/functional/adapters/dashboard-adapter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileSpreadsheet, CalendarCheck, Megaphone, Bell, ClipboardList, UserCircle, BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const COLORS = ['var(--success)', 'var(--destructive)', 'var(--warning)'];

export function ParentDashboard() {
  const user = useAuthStore(state => state.user);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-parent-metrics", user?.id],
    queryFn: () => DashboardAdapter.getParentMetrics(user?.id || ""),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const attendanceData = [
    { name: "Present", value: metrics?.attendanceSummary.present || 0, fill: COLORS[0] },
    { name: "Absent", value: metrics?.attendanceSummary.absent || 0, fill: COLORS[1] },
    { name: "Late", value: metrics?.attendanceSummary.late || 0, fill: COLORS[2] },
  ].filter(d => d.value > 0);

  const attendanceChartConfig = {
    value: { label: "Records" },
    Present: { label: "Present", color: COLORS[0] },
    Absent: { label: "Absent", color: COLORS[1] },
    Late: { label: "Late", color: COLORS[2] },
  } satisfies ChartConfig;

  const performanceChartConfig = {
    score: { label: "Average Score", color: "var(--primary)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/parent-children">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Wards</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.myWardsCount || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/parent-notifications">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.unreadNotifications || 0}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attendance">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium mt-2">View Records</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/results">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Academics</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium mt-2">View Results</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wards Performance</CardTitle>
            <CardDescription>Recent overall academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.wardsPerformance && metrics.wardsPerformance.length > 0 ? (
              <ChartContainer config={performanceChartConfig} className="min-h-[250px] w-full">
                <BarChart data={metrics.wardsPerformance} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={4}>
                    <LabelList dataKey="name" position="insideLeft" fill="white" fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No performance data available.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Overall attendance summary for your wards</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceData.length > 0 ? (
              <ChartContainer config={attendanceChartConfig} className="min-h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={attendanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} strokeWidth={2}>
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
                No attendance recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
