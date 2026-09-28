"use client";

import { useMemo, useState } from "react";
import { useAssessmentReferences, useStudentReportCard } from "@/hooks/use-assessments";
import { useStudent } from "@/hooks/use-students";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
import styles from "./student-report-card.module.css";

export function StudentReportCard({ studentId, title = "Student result" }: { studentId: string; title?: string }) {
  const references = useAssessmentReferences();
  const studentQuery = useStudent(studentId);
  const years = references.data?.academicYears ?? [];
  const [selectedYearId, setSelectedYearId] = useState("");
  const yearId = selectedYearId || years[0]?.id || "";
  const terms = useMemo(() => references.data?.terms.filter((term) => term.academicYearId === yearId) ?? [], [references.data?.terms, yearId]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const termId = terms.some((term) => term.id === selectedTermId) ? selectedTermId : terms[0]?.id ?? "";
  const report = useStudentReportCard(studentId, yearId, termId);
  const forbidden = report.error instanceof AssessmentDomainError && report.error.code === "FORBIDDEN";
  const selectedYear = years.find((year) => year.id === yearId);
  const selectedTerm = terms.find((term) => term.id === termId);

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1"><label className="text-sm font-medium" htmlFor="report-year">Academic year</label><select id="report-year" className="h-9 rounded-md border bg-background px-3 text-sm" value={yearId} onChange={(event) => { setSelectedYearId(event.target.value); setSelectedTermId(""); }}>{years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></div>
        <div className="space-y-1"><label className="text-sm font-medium" htmlFor="report-term">Term</label><select id="report-term" className="h-9 rounded-md border bg-background px-3 text-sm" value={termId} onChange={(event) => setSelectedTermId(event.target.value)}>{terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}</select></div>
      </div>
      <button type="button" onClick={() => window.print()} className="h-9 rounded-md border px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Print</button>
    </div>
    {references.isLoading || studentQuery.isLoading || (Boolean(yearId && termId) && report.isLoading) ? <div role="status" className="flex min-h-40 items-center justify-center"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Loading {title.toLowerCase()}...</span></div> : forbidden ? <ForbiddenState title="Results access denied" /> : studentQuery.isError || references.isError || report.isError ? <ErrorState title="Unable to load results" description="Refresh to try loading the selected academic record." onRetry={() => { void references.refetch(); void studentQuery.refetch(); void report.refetch(); }} /> : !studentQuery.data ? <p className="rounded-lg border p-5 text-sm">Student not found.</p> : !yearId || !termId ? <p className="rounded-lg border p-5 text-sm">No academic term is available.</p> : !report.data?.subjects.length ? <p className="rounded-lg border p-5 text-sm">No assessment results exist for this student and term.</p> : <article className={`${styles.printRoot} space-y-5 rounded-lg border bg-card p-5 print:border-0 print:p-0`}>
      <header className="border-b pb-4"><p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">CarePoint · {title}</p><h2 className="mt-2 text-xl font-semibold">{report.data.student.firstName} {report.data.student.middleName ? `${report.data.student.middleName} ` : ""}{report.data.student.lastName}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedYear?.name} · {selectedTerm?.name} · {references.data?.classes.find((item) => item.id === report.data?.classId)?.name}</p></header>
      <section aria-label="Subject results" className="space-y-4">{report.data.subjects.map((subject) => <div key={subject.subjectId} className="rounded-md border p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{subject.subjectName}</h3><p className="text-xs text-muted-foreground">Assessment weights: {subject.totalWeightPercent}%</p></div><div className="text-right">{subject.isComplete ? <><p className="font-semibold">{subject.totalPercentage}% · {subject.grade}</p><p className="text-sm text-muted-foreground">{subject.remark}{subject.gradePoint !== undefined ? ` · ${subject.gradePoint} points` : ""}</p></> : <p className="text-sm text-muted-foreground">Subject result pending completion</p>}</div></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-3 font-medium">Assessment</th><th className="py-2 pr-3 font-medium">Score</th><th className="py-2 pr-3 font-medium">Percentage</th><th className="py-2 pr-3 font-medium">Weight</th><th className="py-2 font-medium">Status</th></tr></thead><tbody>{subject.assessments.map((assessment) => <tr key={assessment.assessmentId} className="border-b last:border-0"><td className="py-2 pr-3">{assessment.title}</td><td className="py-2 pr-3">{assessment.score === undefined ? "—" : `${assessment.score} / ${assessment.maximumScore}`}</td><td className="py-2 pr-3">{assessment.percentage === undefined ? "—" : `${assessment.percentage}% · ${assessment.grade}`}</td><td className="py-2 pr-3">{assessment.weightPercent}%</td><td className="py-2">{assessment.status === "MISSING" ? "Not entered" : assessment.status === "ENTERED" ? "Entered" : "Finalized"}</td></tr>)}</tbody></table></div></div>)}</section>
      <section aria-label="Attendance summary" className="border-t pt-4"><h3 className="font-semibold">Attendance summary</h3><dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">{Object.entries(report.data.attendance).map(([label, count]) => <div key={label} className="rounded-md bg-muted/40 p-2"><dt className="capitalize text-muted-foreground">{label}</dt><dd className="font-medium">{count}</dd></div>)}</dl></section>
    </article>}
  </div>;
}
