"use client";
import { useParams } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { StudentReportCard } from "@/components/assessments/student-report-card";
import { permissions } from "@/lib/authorization/permissions";
export default function StudentReportCardPage() { const { studentId } = useParams<{ studentId: string }>(); return <PageShell title="Report card" breadcrumbs={[{ label: "Report cards", href: "/report-cards" }, { label: "Preview" }]} permission={permissions.resultsView}><StudentReportCard studentId={studentId} title="Report card" /></PageShell>; }
