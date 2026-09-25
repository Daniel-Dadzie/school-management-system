"use client";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarCheck } from "lucide-react";
import PageShell from "@/components/layout/page-shell";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function TakeAttendance() {
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // We would normally fetch assignments to populate these dropdowns.
  // We'll stub out the form for now.

  return (
    <PageShell title="Page" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Take Attendance" }]}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Take Attendance</h2>
        <div className="p-4 border rounded shadow-sm">
          <p className="text-sm text-muted-foreground mb-4">Select the class and subject to record attendance for today.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
             <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
             <input type="text" placeholder="Term ID" value={termId} onChange={e => setTermId(e.target.value)} className="border p-2 rounded" />
             <input type="text" placeholder="Class ID" value={classId} onChange={e => setClassId(e.target.value)} className="border p-2 rounded" />
             <input type="text" placeholder="Subject ID" value={subjectId} onChange={e => setSubjectId(e.target.value)} className="border p-2 rounded" />
          </div>
          <Button>Load Students</Button>
        </div>
        
        <EmptyState
          title="No students loaded"
          description="Please select a term, class, and subject to begin."
          icon={<CalendarCheck className="w-10 h-10 text-muted-foreground" />}
        />
      </div>
    </PageShell>
  );
}