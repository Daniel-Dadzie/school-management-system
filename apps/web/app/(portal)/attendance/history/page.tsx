"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { History } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { useState } from "react";

export default function AttendanceHistory() {
  const [termId, setTermId] = useState("");

  const { data: records, isLoading } = useQuery({
    queryKey: ["attendance-history", termId],
    queryFn: async () => apiClient<any[]>(`/attendance?termId=${termId}`),
    enabled: !!termId,
  });

  return (
    <PageShell title="Page" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "History" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Attendance History</h2>
        
        <div className="p-4 border rounded shadow-sm flex gap-4">
           <input type="text" placeholder="Enter Term ID to filter..." value={termId} onChange={e => setTermId(e.target.value)} className="border p-2 rounded w-full max-w-sm" />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : !records || records.length === 0 ? (
          <EmptyState
            title="No Attendance Records"
            description="No attendance records match your filters."
            icon={<History className="w-10 h-10 text-muted-foreground" />}
          />
        ) : (
          <div className="grid gap-4">
            {records.map((r: any) => (
              <div key={r.id} className="p-4 border rounded shadow-sm">
                Date: {r.attendanceDate} | Student: {r.studentId} | Status: {r.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}