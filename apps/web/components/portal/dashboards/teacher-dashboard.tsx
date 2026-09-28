"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardAdapter } from "@/lib/functional/adapters/dashboard-adapter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookMarked, CalendarCheck, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const COLORS = ['hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--warning))'];

export function TeacherDashboard() {
  const user = useAuthStore(state => state.user);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["dashboard-teacher-metrics", user?.id],
    queryFn: () => DashboardAdapter.getTeacherMetrics(user?.id || ""),
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
    value: { label: "Students" },
    Present: { label: "Present", color: COLORS[0] },
    Absent: { label: "Absent", color: COLORS[1] },
    Late: { label: "Late", color: COLORS[2] },
  } satisfies ChartConfig;

  const performanceChartConfig = {
    average: { label: "Average Score", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/teacher-classes">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.myClassesCount || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/students">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.myStudentsCount || 0}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attendance">
          <Card className="transition-colors hover:border-primary cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance To Take</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Today</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>Average scores across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.classPerformance && metrics.classPerformance.length > 0 ? (
              <ChartContainer config={performanceChartConfig} className="min-h-[250px] w-full">
                <BarChart data={metrics.classPerformance}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="average" fill="var(--color-average)" radius={8} />
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
            <CardTitle>My Students Attendance</CardTitle>
            <CardDescription>Today&apos;s attendance overview</CardDescription>
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
                No attendance recorded today for your students.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
