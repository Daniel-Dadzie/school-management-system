"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateSchoolClass } from "@/lib/api/academic";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";

export default function BulkClassesPage() {
  const router = useRouter();
  const { mutateAsync: createClass, isPending } = useCreateSchoolClass();
  
  const [rows, setRows] = useState([
    { id: "1", name: "", level: "", capacity: "30" },
    { id: "2", name: "", level: "", capacity: "30" },
    { id: "3", name: "", level: "", capacity: "30" },
  ]);

  const addRow = () => {
    setRows([...rows, { id: Math.random().toString(), name: "", level: "", capacity: "30" }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: "name" | "level" | "capacity", value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    // Filter out rows that have no name or level
    const validRows = rows.filter(r => r.name.trim() !== "" && r.level.trim() !== "");
    
    if (validRows.length === 0) {
      toast.error("No valid classes to save. Please fill in the required fields.");
      return;
    }

    let successCount = 0;
    try {
      for (const row of validRows) {
        await createClass({
          name: row.name,
          level: row.level,
          capacity: row.capacity ? parseInt(row.capacity, 10) : undefined,
        });
        successCount++;
      }
      toast.success(`Successfully created ${successCount} classes!`);
      router.push("/academic-setup/classes");
    } catch (error) {
      toast.error("An error occurred while saving some classes.");
    }
  };

  return (
    <PageShell 
      title="Bulk Add Classes" 
      description="Quickly create multiple classes at once."
      breadcrumbs={[
        { label: "Academic Setup", href: "/academic-setup" },
        { label: "Classes", href: "/academic-setup/classes" },
        { label: "Bulk Create" }
      ]}
      permission={permissions.academicsManage}
    >
      <Card className="max-w-5xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
          <div>
            <CardTitle>Spreadsheet Entry</CardTitle>
            <CardDescription>Enter class details line by line. Empty rows will be ignored.</CardDescription>
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
                  <th className="px-6 py-4 font-semibold">Class Name *</th>
                  <th className="px-6 py-4 font-semibold">Grade Level *</th>
                  <th className="px-6 py-4 font-semibold w-32">Capacity</th>
                  <th className="px-6 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-3">
                      <Input 
                        placeholder="e.g. Grade 10A" 
                        value={row.name} 
                        onChange={(e) => updateRow(row.id, "name", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Input 
                        placeholder="e.g. Grade 10" 
                        value={row.level} 
                        onChange={(e) => updateRow(row.id, "level", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <Input 
                        type="number" 
                        placeholder="30" 
                        value={row.capacity} 
                        onChange={(e) => updateRow(row.id, "capacity", e.target.value)} 
                        className="border-0 bg-transparent focus-visible:ring-1 shadow-none text-center"
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
            {isPending ? "Saving..." : "Save All Classes"}
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}