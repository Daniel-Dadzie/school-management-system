/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
"use client";

import { useAdmissionApplications } from "@/lib/api/admissions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, BookOpen, ClipboardList, CalendarCheck, Check, X, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { DashboardAdapter, AdminMetrics } from "@/lib/functional/adapters/dashboard-adapter";
import { AdmissionAdapter } from "@/lib/functional/adapters/admission-adapter";
import { AdmissionStatus } from "@/lib/api/admissions";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const enrollmentChartConfig = {
  count: {
    label: "Students",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

const attendanceChartConfig = {
  present: {
    label: "Present",
    color: "var(--success)",
  },
  absent: {
    label: "Absent",
    color: "var(--destructive)",
  },
  late: {
    label: "Late",
    color: "var(--warning)",
  },
} satisfies ChartConfig;

interface IncidentSummary {
  title?: string;
  description?: string;
}

export function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        return await DashboardAdapter.getMetrics();
      } catch {
        return null;
      }
    }
  });

    const queryClient = useQueryClient();
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number, status: AdmissionStatus }) =>
      AdmissionAdapter.updateStatus(String(id), { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    }
  });

  const { data: allApplications, isLoading: appsLoading } = useAdmissionApplications();
  const applications = allApplications?.filter((application) =>
    application.status === "PENDING" || application.status === "UNDER_REVIEW"
  );

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["recent-incidents"],
    queryFn: async () => {
      try {
        return await apiClient<IncidentSummary[]>("/incidents/recent?size=5");
      } catch {
        return [];
      }
    }
  });

  // Prepare Pie Chart data
  const pieData = metrics?.attendanceSummary ? [
    { name: "present", value: metrics.attendanceSummary.present, fill: "var(--color-present)" },
    { name: "absent", value: metrics.attendanceSummary.absent, fill: "var(--color-absent)" },
    { name: "late", value: metrics.attendanceSummary.late, fill: "var(--color-late)" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Students" icon={Users} value={metrics?.studentsCount} loading={metricsLoading} href="/students" />
        <MetricCard title="Teachers" icon={BookOpen} value={metrics?.teachersCount} loading={metricsLoading} href="/users" />
        <MetricCard title="Pending applications" icon={ClipboardList} value={metrics?.pendingApplicationsCount} loading={metricsLoading} href="/admissions-admin" />
        <MetricCard title="Attendance today" icon={CalendarCheck} value={metrics?.attendanceTodayCount} loading={metricsLoading} href="/attendance/history" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Enrollment Distribution</CardTitle>
            <CardDescription>Active students per class grade</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
               <div className="flex h-48 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : metrics?.enrollmentDistribution && metrics.enrollmentDistribution.length > 0 ? (
               <ChartContainer config={enrollmentChartConfig} className="min-h-[200px] w-full">
                 <BarChart accessibilityLayer data={metrics.enrollmentDistribution}>
                   <CartesianGrid vertical={false} />
                   <XAxis dataKey="grade" tickLine={false} tickMargin={10} axisLine={false} />
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                 </BarChart>
               </ChartContainer>
            ) : (
               <div className="flex h-48 items-center justify-center text-muted-foreground">No enrollment data</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Today&apos;s Attendance Overview</CardTitle>
            <CardDescription>School-wide attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
               <div className="flex h-48 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : metrics?.attendanceTodayCount ? (
               <ChartContainer config={attendanceChartConfig} className="min-h-[200px] w-full">
                 <PieChart>
                   <ChartTooltip content={<ChartTooltipContent />} />
                   <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} />
                   <ChartLegend content={<ChartLegendContent />} />
                 </PieChart>
               </ChartContainer>
            ) : (
               <div className="flex h-48 items-center justify-center text-muted-foreground">No attendance records today</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Pending applications</CardTitle>
            <CardDescription>Applications waiting for review</CardDescription>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{app.studentFirstName} {app.studentLastName}</p>
                      <p className="text-xs text-muted-foreground">{app.applyingForClass}</p>
                    </div>
                                        <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-success hover:text-success" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'APPROVED' })} disabled={updateStatusMutation.isPending}><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'REJECTED' })} disabled={updateStatusMutation.isPending}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No pending applications" description="All applications have been reviewed." icon={<ClipboardList className="h-10 w-10 text-muted-foreground" />} />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Recent incidents</CardTitle>
            <CardDescription>Latest discipline or health reports</CardDescription>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : incidents && incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident, i) => (
                  <div key={i} className="flex items-start justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{incident.title || "Incident Report"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{incident.description || "No description provided."}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No recent incidents" description="No incidents recorded recently." icon={<BookOpen className="h-10 w-10 text-muted-foreground" />} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, icon: Icon, value, loading, href }: { title: string, icon: any, value?: number | null, loading: boolean, href?: string }) {
  const inner = (
    <Card className={href ? "h-full transition-all duration-200 hover:border-primary/50 hover:bg-accent/25 hover:shadow-md cursor-pointer" : "shadow-xs h-full"}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner className="h-5 w-5 text-primary my-1" />
        ) : (
          <div className="text-2xl font-bold text-foreground">
            {value !== undefined && value !== null ? value : "--"}
          </div>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner;
}
