"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSubject } from "@/lib/api/academic";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";

export default function BulkSubjectsPage() {
  const router = useRouter();
  const { mutateAsync: createSubject, isPending } = useCreateSubject();
  
  const [rows, setRows] = useState([
    { id: "1", name: "", code: "", department: "" },
    { id: "2", name: "", code: "", department: "" },
    { id: "3", name: "", code: "", department: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { id: Math.random().toString(), name: "", code: "", department: "" }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: "name" | "code" | "department", value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    // Filter out rows that have no name or code
    const validRows = rows.filter(r => r.name.trim() !== "" && r.code.trim() !== "");
    
    if (validRows.length === 0) {
      toast.error("No valid subjects to save. Please fill in the required fields.");
      return;
    }

    let successCount = 0;
    try {
      for (const row of validRows) {
        await createSubject({
          name: row.name,
          code: row.code,
          department: row.department.trim() !== "" ? row.department : undefined,
        });
        successCount++;
      }
      toast.success(`Successfully created ${successCount} subjects!`);
      router.push("/academic-setup/subjects");
    } catch (error) {
      toast.error("An error occurred while saving some subjects.");
    }
  };

  return (
    <PageShell 
      title="Bulk Add Subjects" 
      description="Quickly create multiple subjects at once."
      breadcrumbs={[
        { label: "Academic Setup", href: "/academic-setup" },
        { label: "Subjects", href: "/academic-setup/subjects" },
        { label: "Bulk Create" }
      ]}
      permission={permissions.academicsManage}
    >
      <Card className="max-w-5xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
          <div>
            <CardTitle>Spreadsheet Entry</CardTitle>
            <CardDescription>Enter subject details line by line. Empty rows will be ignored.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subject Name *</th>
                  <th className="px-6 py-4 font-semibold">Code *</th>
                  <th className="px-6 py-4 font-semibold">Department</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-3">
                      <Input 
                        placeholder="e.g. Mathematics" 
                        value={row.name} 
                        onChange={(e) => updateRow(row.id, "name", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Input 
                        placeholder="e.g. MATH-101" 
                        value={row.code} 
                        onChange={(e) => updateRow(row.id, "code", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Input 
                        placeholder="e.g. Science" 
                        value={row.department} 
                        onChange={(e) => updateRow(row.id, "department", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none"
                      />
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
          <div className="p-4 border-t bg-muted/10">
            <Button variant="ghost" size="sm" onClick={addRow} className="text-primary hover:text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
          </div>
        </CardContent>
        <CardFooter className="border-t p-6 flex justify-between bg-muted/20">
          <p className="text-xs text-muted-foreground">Rows marked with * are required.</p>
          <Button onClick={handleSave} disabled={isPending} className="min-w-32">
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isPending ? "Saving..." : "Save All Subjects"}
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}