"use client";

import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { Server, CheckCircle2, XCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";

export default function SystemStatusPage() {
  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => apiClient<{ status: string }>("/actuator/health", { requiresAuth: false }),
  });

  return (
    <PageShell
      title="System Status"
      description="Check the integration and health of backend services."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "System Status" }
      ]}
      actions={
        <Button onClick={() = allowedRoles={["SUPER_ADMIN", "ADMIN"]}> refetch()} variant="outline">
          Refresh Status
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Integration</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Connecting...</span>
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-semibold">Connection Failed</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Status: {data?.status || "UP"}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {isError ? (error as Error).message : "Spring Boot backend connectivity check."}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
