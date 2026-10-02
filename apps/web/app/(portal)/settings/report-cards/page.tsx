"use client";

import { useEffect } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save } from "lucide-react";
import Link from 'next/link';

import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportCardConfig, useUpdateReportCardConfig } from "@/lib/api/settings";
import { permissions } from "@/lib/authorization/permissions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const configSchema = z.object({
  showLogo: z.boolean(),
  showWatermark: z.boolean(),
  showSchoolAddress: z.boolean(),
  showContactInformation: z.boolean(),
  showMotto: z.boolean(),
  showStudentPhoto: z.boolean(),
  showDateOfBirth: z.boolean(),
  showGender: z.boolean(),
  showStudentId: z.boolean(),
  showClass: z.boolean(),
  showAcademicYear: z.boolean(),
  showTerm: z.boolean(),
  showTermDates: z.boolean(),
  showReportIssueDate: z.boolean(),
  showAssessmentBreakdown: z.boolean(),
  showSubjectTotals: z.boolean(),
  showGrades: z.boolean(),
  showGradePoints: z.boolean(),
  showRemarks: z.boolean(),
  showAttendance: z.boolean(),
  showPosition: z.boolean(),
  showOverallAverage: z.boolean(),
  showClassTeacherComment: z.boolean(),
  showHeadTeacherComment: z.boolean(),
  showPromotionStatus: z.boolean(),
  showSignatureAreas: z.boolean(),
  footerText: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface CheckboxItemProps {
  name: keyof ConfigFormData;
  label: string;
  control: Control<ConfigFormData>;
}

function CheckboxItem({ name, label, control }: CheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2 py-2">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            id={name}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Label htmlFor={name} className="flex-1 cursor-pointer">{label}</Label>
    </div>
  );
}

function ConfigFormContent() {
  const { data: config, isLoading: isFetching } = useReportCardConfig();
  const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateReportCardConfig();

  const { register, control, handleSubmit, reset } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      showLogo: true,
      showWatermark: true,
      showSchoolAddress: true,
      showContactInformation: true,
      showMotto: true,
      showStudentPhoto: true,
      showDateOfBirth: true,
      showGender: true,
      showStudentId: true,
      showClass: true,
      showAcademicYear: true,
      showTerm: true,
      showTermDates: true,
      showReportIssueDate: true,
      showAssessmentBreakdown: true,
      showSubjectTotals: true,
      showGrades: true,
      showGradePoints: true,
      showRemarks: true,
      showAttendance: true,
      showPosition: false,
      showOverallAverage: true,
      showClassTeacherComment: true,
      showHeadTeacherComment: true,
      showPromotionStatus: true,
      showSignatureAreas: true,
      footerText: "",
    },
  });

  useEffect(() => {
    if (config) {
      reset({
        showLogo: config.showLogo,
        showWatermark: config.showWatermark,
        showSchoolAddress: config.showSchoolAddress,
        showContactInformation: config.showContactInformation,
        showMotto: config.showMotto,
        showStudentPhoto: config.showStudentPhoto,
        showDateOfBirth: config.showDateOfBirth,
        showGender: config.showGender,
        showStudentId: config.showStudentId,
        showClass: config.showClass,
        showAcademicYear: config.showAcademicYear,
        showTerm: config.showTerm,
        showTermDates: config.showTermDates,
        showReportIssueDate: config.showReportIssueDate,
        showAssessmentBreakdown: config.showAssessmentBreakdown,
        showSubjectTotals: config.showSubjectTotals,
        showGrades: config.showGrades,
        showGradePoints: config.showGradePoints,
        showRemarks: config.showRemarks,
        showAttendance: config.showAttendance,
        showPosition: config.showPosition,
        showOverallAverage: config.showOverallAverage,
        showClassTeacherComment: config.showClassTeacherComment,
        showHeadTeacherComment: config.showHeadTeacherComment,
        showPromotionStatus: config.showPromotionStatus,
        showSignatureAreas: config.showSignatureAreas,
        footerText: config.footerText || "",
      });
    }
  }, [config, reset]);

  if (isFetching) {
    return <LoadingSpinner />;
  }

  const onSubmit = async (data: ConfigFormData) => {
    try {
      await updateConfig(data);
      toast.success("Report card configuration updated successfully");
    } catch {
      toast.error("Failed to update report card configuration");
    }
  };

  return (
    <PageShell 
      title="Report Card Settings" 
      description="Configure the appearance and content of generated report cards." 
      breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Report Cards" }]} 
      permission={permissions.systemManage}
    >
      <div className="mb-6 flex space-x-4 border-b pb-4">
        <Link href="/settings" className="text-sm font-medium text-muted-foreground hover:text-primary">
          General Settings
        </Link>
        <div className="text-sm font-medium text-primary border-b-2 border-primary pb-4 -mb-4.5">
          Report Cards
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <Card>
            <CardHeader>
              <CardTitle>School Header</CardTitle>
              <CardDescription>Configure the branding and school info section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CheckboxItem control={control} name="showLogo" label="Show School Logo" />
              <CheckboxItem control={control} name="showWatermark" label="Show Logo Watermark" />
              <CheckboxItem control={control} name="showSchoolAddress" label="Show School Address" />
              <CheckboxItem control={control} name="showContactInformation" label="Show Contact Information" />
              <CheckboxItem control={control} name="showMotto" label="Show School Motto" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>Configure the student details section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CheckboxItem control={control} name="showStudentPhoto" label="Show Student Photo" />
              <CheckboxItem control={control} name="showDateOfBirth" label="Show Date of Birth" />
              <CheckboxItem control={control} name="showGender" label="Show Gender" />
              <CheckboxItem control={control} name="showStudentId" label="Show Student ID" />
              <CheckboxItem control={control} name="showClass" label="Show Class" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Academic Results</CardTitle>
              <CardDescription>Configure how grades are presented.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CheckboxItem control={control} name="showAssessmentBreakdown" label="Show Assessment Breakdown" />
              <CheckboxItem control={control} name="showSubjectTotals" label="Show Subject Totals" />
              <CheckboxItem control={control} name="showGrades" label="Show Grades" />
              <CheckboxItem control={control} name="showGradePoints" label="Show Grade Points" />
              <CheckboxItem control={control} name="showRemarks" label="Show Remarks" />
              <CheckboxItem control={control} name="showPosition" label="Show Class Position" />
              <CheckboxItem control={control} name="showOverallAverage" label="Show Overall Average" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Sections</CardTitle>
              <CardDescription>Configure extra information displayed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CheckboxItem control={control} name="showAttendance" label="Show Attendance Summary" />
              <CheckboxItem control={control} name="showClassTeacherComment" label="Show Class Teacher Comment" />
              <CheckboxItem control={control} name="showHeadTeacherComment" label="Show Head Teacher Comment" />
              <CheckboxItem control={control} name="showPromotionStatus" label="Show Promotion Status" />
              <CheckboxItem control={control} name="showSignatureAreas" label="Show Signature Areas" />
            </CardContent>
          </Card>

        </div>

        <Card>
          <CardHeader>
            <CardTitle>Footer Text</CardTitle>
            <CardDescription>Add standard legal text or disclaimers at the bottom of every report card.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              {...register("footerText")} 
              placeholder="e.g. This is a computer-generated document." 
              className="resize-y" 
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          Save Configuration
        </Button>
      </form>
    </PageShell>
  );
}

export default function ReportCardsSettingsPage() {
  return <ConfigFormContent />;
}
