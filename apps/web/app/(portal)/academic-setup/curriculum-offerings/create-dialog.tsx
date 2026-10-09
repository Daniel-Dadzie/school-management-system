/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { useCreateCurriculumOffering, useSubjects } from "@/lib/api/academic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateCurriculumOfferingDialog({ academicYearId, gradeLevel }: { academicYearId: string, gradeLevel: string }) {
  const [open, setOpen] = useState(false);
  const { data: subjects } = useSubjects();
  const createMutation = useCreateCurriculumOffering();

  const [subjectId, setSubjectId] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [assessmentEnabled, setAssessmentEnabled] = useState(true);
  const [reportEnabled, setReportEnabled] = useState(true);
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return toast.error("Please select a subject");

    createMutation.mutate(
      {
        academicYearId,
        gradeLevel,
        subjectId,
        isRequired,
        isActive: true,
        assessmentEnabled,
        reportEnabled,
        periodsPerWeek,
      },
      {
        onSuccess: () => {
          toast.success("Offering created successfully");
          setOpen(false);
          // reset form
          setSubjectId("");
          setIsRequired(true);
          setAssessmentEnabled(true);
          setReportEnabled(true);
          setPeriodsPerWeek(undefined);
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to create offering");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Subject to {gradeLevel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Curriculum Offering</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Periods per Week</Label>
            <Input 
               type="number" 
               min={1} 
               value={periodsPerWeek || ""} 
               onChange={e => setPeriodsPerWeek(e.target.value ? parseInt(e.target.value) : undefined)} 
               placeholder="Optional"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRequired" 
                checked={isRequired} 
                onCheckedChange={(c) => setIsRequired(c as boolean)} 
              />
              <Label htmlFor="isRequired" className="font-normal">Required Subject (Core)</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assessmentEnabled" 
                checked={assessmentEnabled} 
                onCheckedChange={(c) => setAssessmentEnabled(c as boolean)} 
              />
              <Label htmlFor="assessmentEnabled" className="font-normal">Enable Assessments & Grading</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="reportEnabled" 
                checked={reportEnabled} 
                onCheckedChange={(c) => setReportEnabled(c as boolean)} 
              />
              <Label htmlFor="reportEnabled" className="font-normal">Include in Terminal Reports</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
               {createMutation.isPending ? "Adding..." : "Add Subject"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
