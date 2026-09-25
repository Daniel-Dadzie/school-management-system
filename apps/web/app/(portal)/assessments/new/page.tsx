"use client";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewAssessment() {
  const [title, setTitle] = useState("");

  return (
    <PageShell title="Create Assessment" breadcrumbs={[{ label: "Assessments", href: "/assessments" }, { label: "New Assessment" }]} allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">Create Assessment</h2>
        
        <div className="space-y-4 p-4 border rounded shadow-sm">
           <div>
             <label className="block text-sm font-medium mb-1">Assessment Title</label>
             <input type="text" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mid-Term Exam" />
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Term</label>
             <select className="w-full border p-2 rounded"><option value="">Select...</option></select>
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Class</label>
             <select className="w-full border p-2 rounded"><option value="">Select...</option></select>
           </div>
           <div>
             <label className="block text-sm font-medium mb-1">Subject</label>
             <select className="w-full border p-2 rounded"><option value="">Select...</option></select>
           </div>
           <Button>Create Assessment</Button>
        </div>
      </div>
    </PageShell>
  );
}