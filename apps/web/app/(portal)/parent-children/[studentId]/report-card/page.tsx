/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck

"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/layout/page-shell";
import { StudentReportCard } from "@/components/assessments/student-report-card";
import { permissions } from "@/lib/authorization/permissions";
import { useStudentFees } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { formatMoneyMinor } from "@/lib/format";

export default function ParentReportCardPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { data: financeData } = useFinanceStudentFees(studentId);
  const outstanding = financeData?.summary?.outstandingMinor ?? 0;
  const isLocked = outstanding > 0;

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
      {isLocked ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/30">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Report Card Locked</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            This student's academic report card is currently locked due to an outstanding fee balance of {formatMoneyMinor(outstanding)}.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href={"/parent-children/" + studentId + "/fees"}>View Outstanding Fees</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/parent-wallet">Fund Family Wallet</Link>
            </Button>
          </div>
        </div>
      ) : (
        <StudentReportCard studentId={studentId} title="Academic Report Card" isParentView={true} />
      )}
    </PageShell>
  );
}
