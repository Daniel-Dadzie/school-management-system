/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, BookOpen, ClipboardList, CalendarCheck, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/shared/empty-state";

interface AdminMetrics {
  studentsCount: number;
  teachersCount: number;
  pendingApplicationsCount: number;
  attendanceTodayCount: number;
}

export function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        return await apiClient<AdminMetrics>("/dashboard/metrics");
      } catch {
        return null;
      }
    }
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["pending-applications"],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/admissions/applications?status=PENDING&size=5");
      } catch {
        return [];
      }
    }
  });

  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ["recent-incidents"],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/incidents/recent?size=5");
      } catch {
        return [];
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Students" icon={Users} value={metrics?.studentsCount} loading={metricsLoading} />
        <MetricCard title="Teachers" icon={BookOpen} value={metrics?.teachersCount} loading={metricsLoading} />
        <MetricCard title="Pending applications" icon={ClipboardList} value={metrics?.pendingApplicationsCount} loading={metricsLoading} />
        <MetricCard title="Attendance today" icon={CalendarCheck} value={metrics?.attendanceTodayCount} loading={metricsLoading} />
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
                {applications.map((app, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{app.applicantName || "Unknown Applicant"}</p>
                      <p className="text-xs text-muted-foreground">{app.gradeLevel || "Unknown Grade"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 text-success hover:text-success"><Check className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:text-destructive"><X className="h-4 w-4" /></Button>
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

function MetricCard({ title, icon: Icon, value, loading }: { title: string, icon: React.ElementType, value?: number | null, loading: boolean }) {
  return (
    <Card className="shadow-xs">
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
}
