"use client";
import { useState } from "react";
import { useAcademicYears, useCurriculumOfferings, useSchoolClasses } from "@/lib/api/academic";
import { LoadingSpinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { BookOpen, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateCurriculumOfferingDialog } from "./create-dialog";

export default function CurriculumOfferingsPage() {
  const { data: academicYears, isLoading: loadingYears } = useAcademicYears();
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const { data: classes } = useSchoolClasses();
  // Extract unique grade levels
  const levels = Array.from(new Set(classes?.map(c => c.level) || []));

  const activeYear = selectedYear || academicYears?.find(y => y.status === "ACTIVE")?.id || academicYears?.[0]?.id;

  const { data: offerings, isLoading: loadingOfferings } = useCurriculumOfferings(activeYear, selectedLevel);

  if (loadingYears) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Curriculum Offerings</h2>
        {activeYear && selectedLevel && (
          <CreateCurriculumOfferingDialog 
             academicYearId={activeYear} 
             gradeLevel={selectedLevel} 
          />
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={activeYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears?.map(year => (
              <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Grade Level" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedLevel ? (
        <EmptyState
          title="Select a Grade Level"
          description="Choose a grade level to view its curriculum offerings."
          icon={<BookOpen className="w-10 h-10 text-muted-foreground" />}
        />
      ) : loadingOfferings ? (
        <LoadingSpinner />
      ) : !offerings || offerings.length === 0 ? (
        <EmptyState
          title="No Offerings Found"
          description={`No subjects are configured for ${selectedLevel} in the selected academic year.`}
          icon={<BookOpen className="w-10 h-10 text-muted-foreground" />}
          action={
            <CreateCurriculumOfferingDialog 
              academicYearId={activeYear!} 
              gradeLevel={selectedLevel} 
            />
          }
        />
      ) : (
        <div className="grid gap-4">
          {offerings.map(offering => (
            <div key={offering.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center bg-white dark:bg-zinc-900">
              <div>
                <h3 className="font-semibold text-lg">{offering.subject.name} ({offering.subject.code})</h3>
                <div className="text-sm text-gray-500">
                  {offering.isRequired ? "Required" : "Optional"} • 
                  {offering.periodsPerWeek ? ` ${offering.periodsPerWeek} Periods/Week` : " No periods configured"}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                 <span className={offering.assessmentEnabled ? "text-green-600 font-medium" : "text-gray-400"}>Assessments</span>
                 <span className={offering.reportEnabled ? "text-green-600 font-medium" : "text-gray-400"}>Reports</span>
                 <span className={offering.isActive ? "text-blue-600 font-medium" : "text-red-500 font-medium"}>{offering.isActive ? "Active" : "Inactive"}</span>
                 
                 <div className="flex space-x-2 pl-4 border-l">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
