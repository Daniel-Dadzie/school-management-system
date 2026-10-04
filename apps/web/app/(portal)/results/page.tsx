"use client";
import { useAuthStore } from "@/stores/auth-store";
import PageShell from "@/components/layout/page-shell";
import { StudentResultsList } from "@/components/assessments/student-results-list";
import { ResultsWorkspace } from "@/components/assessments/results-workspace";
import { permissions } from "@/lib/authorization/permissions";
export default function ResultsOverview() { const role = useAuthStore((state) => state.user?.role); return <PageShell title="Student results" description={role === "PARENT" ? "Review academic results for your linked children." : "Select an academic context to review and enter class results."} breadcrumbs={[{ label: "Results" }]} permission={permissions.resultsView}>{role === "PARENT" ? <StudentResultsList /> : <ResultsWorkspace />}</PageShell>; }
