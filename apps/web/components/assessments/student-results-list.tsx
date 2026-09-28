"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { useAssessmentReferences } from "@/hooks/use-assessments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { FileSpreadsheet, Search } from "lucide-react";

export function StudentResultsList({ reportCards = false }: { reportCards?: boolean }) {
  const studentsQuery = useStudents();
  const references = useAssessmentReferences();
  const [search, setSearch] = useState("");
  const students = useMemo(() => (studentsQuery.data ?? []).filter((student) => `${student.firstName} ${student.lastName} ${student.studentId ?? ""}`.toLowerCase().includes(search.toLowerCase().trim())), [studentsQuery.data, search]);
  const href = (id: string) => `${reportCards ? "/report-cards" : "/results"}/${id}`;
  if (studentsQuery.isLoading || references.isLoading) return <div role="status" className="flex min-h-40 items-center justify-center"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading students...</span></div>;
  if (studentsQuery.isError || references.isError) return <ErrorState title="Unable to load students" description="Try again to load the student list." onRetry={() => { void studentsQuery.refetch(); void references.refetch(); }} />;
  if (!studentsQuery.data?.length) return <EmptyState icon={FileSpreadsheet} title="No students available" description="Students with access in your school will appear here." />;
  return <section className="space-y-4"><div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" /><Input aria-label="Search students" className="pl-9" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name or ID" /></div>{students.length ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{students.map((student) => <li key={student.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4"><div className="min-w-0"><h2 className="truncate font-medium">{student.firstName} {student.lastName}</h2><p className="mt-1 text-sm text-muted-foreground">{student.studentId ?? "Student"} · {references.data?.classes.find((schoolClass) => schoolClass.id === student.currentClassId)?.name ?? "Class unavailable"}</p></div><Button asChild variant="outline" size="sm"><Link href={href(student.id)}>{reportCards ? "Preview" : "View results"}</Link></Button></li>)}</ul> : <EmptyState icon={Search} title="No matching students" description="Try another name or student ID." action={<Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>} />}</section>;
}
