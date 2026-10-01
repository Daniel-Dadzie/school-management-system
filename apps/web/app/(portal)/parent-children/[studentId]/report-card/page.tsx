"use client";
import { useParams } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { StudentReportCard } from "@/components/assessments/student-report-card";
import { permissions } from "@/lib/authorization/permissions";
export default function ParentReportCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  return (
    <PageShell 
      title="Academic Report Card" 
      breadcrumbs={[
        { label: "My children", href: "/parent-children" }, 
        { label: "Child profile", href: "/parent-children/" + studentId },
        { label: "Report card" }
      ]} 
      permission={permissions.parentChildrenView}
    >
      <StudentReportCard studentId={studentId} title="Academic Report Card" isParentView={true} />
    </PageShell>
  );
}
