"use client";

import { useQuery } from "@tanstack/react-query";
import { Server, Activity, ShieldAlert, Users, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/shared/empty-state";

interface SystemMetrics {
  activeSessions: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
}

export function SuperAdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["system-metrics"],
    queryFn: async () => {
      try {
        return await apiClient<SystemMetrics>("/system/metrics");
      } catch {
        return null;
      }
    }
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["recent-audit-logs"],
    queryFn: async () => {
      try {
        return await apiClient<Record<string, unknown>[]>("/audit/recent?size=5");
      } catch {
        return null;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? <LoadingSpinner className="h-4 w-4" /> : (
              metrics ? <div className="text-2xl font-bold">{metrics.activeSessions}</div> : <div className="text-sm text-muted-foreground">Data unavailable (Backend dependency)</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? <LoadingSpinner className="h-4 w-4" /> : (
              metrics ? <div className="text-2xl font-bold">{metrics.uptime}</div> : <div className="text-sm text-muted-foreground">Data unavailable</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? <LoadingSpinner className="h-4 w-4" /> : (
              metrics ? <div className="text-2xl font-bold">{metrics.cpuUsage}%</div> : <div className="text-sm text-muted-foreground">Data unavailable</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? <LoadingSpinner className="h-4 w-4" /> : (
              metrics ? <div className="text-2xl font-bold">{metrics.memoryUsage}%</div> : <div className="text-sm text-muted-foreground">Data unavailable</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Audit Activity</CardTitle>
            <CardDescription>Platform-wide administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <LoadingSpinner />
            ) : !auditLogs || auditLogs.length === 0 ? (
              <EmptyState 
                title="Audit Logs Unavailable" 
                description="The audit log backend service is currently not implemented or unreachable." 
                icon={<ShieldAlert className="h-10 w-10 text-muted-foreground" />} 
              />
            ) : (
              <div className="space-y-4">
                {auditLogs.map((log: Record<string, unknown>) => (
                  <div key={log.id as string} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium">{log.action as string}</p>
                      <p className="text-xs text-muted-foreground">{log.actor as string} - {log.resource as string}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(log.timestamp as string).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status Overview</CardTitle>
            <CardDescription>Health of integration points and services</CardDescription>
          </CardHeader>
          <CardContent>
             <EmptyState 
                title="System Status Unavailable" 
                description="Status metrics depend on the actuator/health endpoint integration which requires further backend support." 
                icon={<Server className="h-10 w-10 text-muted-foreground" />} 
              />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
