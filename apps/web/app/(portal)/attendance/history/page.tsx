"use client";
import { useAttendanceForTerm } from "@/lib/api/attendance";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/ui/loading";
import { History } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { useState } from "react";
import { permissions } from "@/lib/authorization/permissions";

export default function AttendanceHistory() {
  const [termId, setTermId] = useState("");

  const { data: records, isLoading } = useAttendanceForTerm(termId);

  return (
    <PageShell title="Attendance History" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "History" }]} permission={permissions.attendanceView}>
      <div className="space-y-6">
        
        <div className="p-4 border rounded shadow-sm flex gap-4">
           <select value={termId} onChange={e => setTermId(e.target.value)} className="border p-2 rounded w-full max-w-sm">
             <option value="">Select Term to filter...</option>
           </select>
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
            {records.map((r) => (
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
