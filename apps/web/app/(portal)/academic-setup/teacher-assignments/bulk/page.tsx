"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  useCreateTeacherAssignment, 
  useAcademicYears, 
  useTerms, 
  useAcademicTeacherOptions, 
  useSchoolClasses, 
  useSubjects 
} from "@/lib/api/academic";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";

export default function BulkTeacherAssignmentsPage() {
  const router = useRouter();
  const { mutateAsync: createAssignment, isPending } = useCreateTeacherAssignment();
  
  const { data: years } = useAcademicYears();
  const [academicYearId, setAcademicYearId] = useState("");
  const { data: terms } = useTerms(academicYearId);
  const [termId, setTermId] = useState("");

  const { data: teachers, isError: teacherError } = useAcademicTeacherOptions();
  const { data: classes } = useSchoolClasses();
  const { data: subjects } = useSubjects();
  
  const [rows, setRows] = useState([
    { id: "1", teacherId: "", schoolClassId: "", subjectId: "" },
    { id: "2", teacherId: "", schoolClassId: "", subjectId: "" },
    { id: "3", teacherId: "", schoolClassId: "", subjectId: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { id: Math.random().toString(), teacherId: "", schoolClassId: "", subjectId: "" }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: "teacherId" | "schoolClassId" | "subjectId", value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    if (!academicYearId || !termId) {
      toast.error("Please select an Academic Year and Term first.");
      return;
    }

    const validRows = rows.filter(r => r.teacherId && r.schoolClassId && r.subjectId);
    
    if (validRows.length === 0) {
      toast.error("No valid assignments to save. Please fill all fields in at least one row.");
      return;
    }

    let successCount = 0;
    try {
      for (const row of validRows) {
        await createAssignment({
          academicYearId,
          termId,
          teacherId: row.teacherId,
          schoolClassId: row.schoolClassId,
          subjectId: row.subjectId,
        });
        successCount++;
      }
      toast.success(`Successfully created ${successCount} assignments!`);
      router.push("/academic-setup/teacher-assignments");
    } catch (error) {
      toast.error("An error occurred while saving some assignments.");
    }
  };

  return (
    <PageShell 
      title="Bulk Teacher Assignments" 
      description="Quickly assign teachers to multiple classes and subjects."
      breadcrumbs={[
        { label: "Academic Setup", href: "/academic-setup" },
        { label: "Teacher Assignments", href: "/academic-setup/teacher-assignments" },
        { label: "Bulk Assign" }
      ]}
      permission={permissions.academicsManage}
    >
      <Card className="max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
          <div>
            <CardTitle>Spreadsheet Entry</CardTitle>
            <CardDescription>Assign teachers in bulk for a specific academic term.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </CardHeader>
        
        <div className="p-6 border-b bg-muted/5 flex gap-6 items-end">
          <div className="space-y-2 w-1/3">
            <label className="text-sm font-medium">Academic Year *</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={academicYearId} onChange={(e) => { setAcademicYearId(e.target.value); setTermId(""); }}>
              <option value="">Select Year...</option>
              {years?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
            </select>
          </div>
          <div className="space-y-2 w-1/3">
            <label className="text-sm font-medium">Academic Term *</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" value={termId} onChange={(e) => setTermId(e.target.value)} disabled={!academicYearId}>
              <option value="">Select Term...</option>
              {terms?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <CardContent className="p-0">
          {teacherError ? (
            <div className="p-6 text-sm text-muted-foreground">Teacher selection is unavailable in API mode because a teacher-directory API is not available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/3">Teacher *</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Class *</th>
                    <th className="px-6 py-4 font-semibold w-1/3">Subject *</th>
                    <th className="px-6 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-3">
                        <select className="flex h-10 w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm focus:border-input focus:bg-background" value={row.teacherId} onChange={(e) => updateRow(row.id, "teacherId", e.target.value)}>
                          <option value="">Select Teacher...</option>
                          {teachers?.map(t => <option key={t.id} value={t.id}>{t.displayName}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <select className="flex h-10 w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm focus:border-input focus:bg-background" value={row.schoolClassId} onChange={(e) => updateRow(row.id, "schoolClassId", e.target.value)}>
                          <option value="">Select Class...</option>
                          {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-3">
                        <select className="flex h-10 w-full rounded-md border border-transparent bg-transparent px-3 py-2 text-sm focus:border-input focus:bg-background" value={row.subjectId} onChange={(e) => updateRow(row.id, "subjectId", e.target.value)}>
                          <option value="">Select Subject...</option>
                          {subjects?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeRow(row.id)} 
                          disabled={rows.length === 1}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!teacherError && (
            <div className="p-4 border-t bg-muted/10">
              <Button variant="ghost" size="sm" onClick={addRow} className="text-primary hover:text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" /> Add Row
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-between bg-muted/20">
          <p className="text-xs text-muted-foreground">Empty rows will be ignored.</p>
          <Button onClick={handleSave} disabled={isPending || teacherError || !academicYearId || !termId} className="min-w-32">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isPending ? "Saving..." : "Save All Assignments"}
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}