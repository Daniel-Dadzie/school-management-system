"use client";
import { useParams } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { StudentReportCard } from "@/components/assessments/student-report-card";
import { permissions } from "@/lib/authorization/permissions";
export default function StudentResultsPage() { const { studentId } = useParams<{ studentId: string }>(); return <PageShell title="Student results" breadcrumbs={[{ label: "Results", href: "/results" }, { label: "Student results" }]} permission={permissions.resultsView}><StudentReportCard studentId={studentId} /></PageShell>; }
