"use client";

import { useMemo, useState } from "react";
import { useAssessmentReferences, useStudentReportCard, usePublishReportCard } from "@/hooks/use-assessments";
import { useStudent } from "@/hooks/use-students";
import { useSettings } from "@/lib/api/settings";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
const formatDate = (dateStr: string) => { try { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr)); } catch(e) { return dateStr; } };
import styles from "./student-report-card.module.css";
import Image from "next/image";
import { EditReportCardComments } from "@/components/assessments/edit-report-card-comments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";

import { useAuthStore } from "@/stores/auth-store";


export function StudentReportCard({ studentId, title = "Student result", isParentView = false }: { studentId: string; title?: string; isParentView?: boolean }) {
  const userRole = useAuthStore((state) => state.user)?.role;
  const references = useAssessmentReferences();
  const studentQuery = useStudent(studentId);
  const settingsQuery = useSettings();
  
  const years = references.data?.academicYears ?? [];
  const [selectedYearId, setSelectedYearId] = useState("");
  const yearId = selectedYearId || years[0]?.id || "";
  
  const terms = useMemo(() => references.data?.terms.filter((term) => term.academicYearId === yearId) ?? [], [references.data?.terms, yearId]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const termId = terms.some((term) => term.id === selectedTermId) ? selectedTermId : terms[0]?.id ?? "";
  
  const report = useStudentReportCard(studentId, yearId, termId);
  
  const forbidden = report.error instanceof AssessmentDomainError && report.error.code === "FORBIDDEN";
  
  if (isParentView && report.data && report.data.comments?.status !== 'PUBLISHED') {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border bg-card p-8 text-center shadow-sm">
        <h3 className="text-lg font-medium">Report Card Not Available</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The report card for this academic term has not been published yet. Please check back later.
        </p>
      </div>
    );
  }
  const selectedYear = years.find((year) => year.id === yearId);
  const selectedTerm = terms.find((term) => term.id === termId);
  const schoolClass = references.data?.classes.find((item) => item.id === report.data?.classId);
  const settings = settingsQuery.data;
  const publishMutation = usePublishReportCard();
  
  const handlePublish = () => {
    publishMutation.mutate({ studentId, academicYearId: yearId, termId });
  };

  // Derive report configuration (currently mocked/defaults)
  const config = {
    showLogo: true,
    showSchoolAddress: true,
    showContactInformation: true,
    showMotto: true,
    showStudentPhoto: false,
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
    footerText: "This report card is generated without manual signature and is valid for official academic tracking.",
  };

  const calculateOverallPercentage = () => {
    if (!report.data || !report.data.subjects.length) return undefined;
    const completedSubjects = report.data.subjects.filter(s => s.isComplete && s.totalPercentage !== undefined);
    if (!completedSubjects.length) return undefined;
    const total = completedSubjects.reduce((sum, s) => sum + (s.totalPercentage ?? 0), 0);
    return Math.round((total / completedSubjects.length) * 100) / 100;
  };

  const overallAvg = calculateOverallPercentage();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="report-year">Academic year</label>
            <select id="report-year" className="h-9 rounded-md border bg-background px-3 text-sm" value={yearId} onChange={(event) => { setSelectedYearId(event.target.value); setSelectedTermId(""); }}>
              {years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="report-term">Term</label>
            <select id="report-term" className="h-9 rounded-md border bg-background px-3 text-sm" value={termId} onChange={(event) => setSelectedTermId(event.target.value)}>
              {terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
            </select>
          </div>
        </div>
        {hasPermission(userRole, permissions.resultsManage) && report.data && (
          <EditReportCardComments 
            studentId={studentId}
            academicYearId={yearId}
            termId={termId}
            initialClassTeacherComment={report.data.comments?.classTeacher}
            initialHeadTeacherComment={report.data.comments?.headTeacher}
            canEditHeadTeacherComment={hasPermission(userRole, permissions.systemManage)}
          />
        )}
        <button type="button" onClick={() => window.print()} className="h-9 rounded-md border bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Print Report Card</button>
      </div>

      {references.isLoading || studentQuery.isLoading || settingsQuery.isLoading || (Boolean(yearId && termId) && report.isLoading) ? (
        <div role="status" className="flex min-h-[400px] items-center justify-center rounded-lg border bg-card"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Generating {title.toLowerCase()}...</span></div>
      ) : forbidden ? (
        <ForbiddenState title="Results access denied" />
      ) : studentQuery.isError || references.isError || report.isError || settingsQuery.isError ? (
        <ErrorState title="Unable to load results" description="Refresh to try loading the selected academic record." onRetry={() => { void references.refetch(); void studentQuery.refetch(); void report.refetch(); void settingsQuery.refetch(); }} />
      ) : !studentQuery.data ? (
        <p className="rounded-lg border p-5 text-sm bg-card">Student not found.</p>
      ) : !yearId || !termId ? (
        <p className="rounded-lg border p-5 text-sm bg-card">No academic term is available.</p>
      ) : !report.data?.subjects.length ? (
        <p className="rounded-lg border p-5 text-sm bg-card">No assessment results exist for this student and term.</p>
      ) : (
        <article className={`${styles.printRoot} flex flex-col mx-auto max-w-4xl bg-white text-black min-h-[297mm] p-[16mm] shadow-sm print:shadow-none`}>
          {/* Header Section */}
          <header className="flex flex-col items-center border-b-2 border-black pb-4 text-center">
            {config.showLogo && settings?.logoUrl && (
              <div className="mb-4 h-24 w-24 relative">
                <Image src={settings.logoUrl} alt={`${settings?.institutionName ?? "School"} logo`} fill className="object-contain" />
              </div>
            )}
            <h1 className="text-2xl font-bold uppercase tracking-wider">{settings?.institutionName ?? "CarePoint Community School"}</h1>
            {config.showMotto && <p className="mt-1 text-sm italic">&quot;Excellence in Education&quot;</p>}
            {config.showContactInformation && (
              <p className="mt-2 text-xs">
                Email: {settings?.contactEmail ?? "info@school.com"} | Phone: {settings?.contactPhone ?? "N/A"}
              </p>
            )}
            <h2 className="mt-6 text-xl font-bold uppercase border border-black px-4 py-1 inline-block">Termly Academic Report</h2>
          </header>

          {/* Student & Period Information */}
          <section className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b"><th className="py-1 font-semibold w-1/3">Name:</th><td className="py-1 font-bold uppercase">{report.data.student.firstName} {report.data.student.middleName ? `${report.data.student.middleName} ` : ""}{report.data.student.lastName}</td></tr>
                  {config.showStudentId && <tr className="border-b"><th className="py-1 font-semibold">Student ID:</th><td className="py-1">{report.data.student.id}</td></tr>}
                  {config.showClass && <tr className="border-b"><th className="py-1 font-semibold">Class:</th><td className="py-1">{schoolClass?.name}</td></tr>}
                  {config.showGender && <tr className="border-b"><th className="py-1 font-semibold">Gender:</th><td className="py-1">{report.data.student.gender === 'M' ? 'Male' : report.data.student.gender === 'F' ? 'Female' : report.data.student.gender}</td></tr>}
                  {config.showDateOfBirth && report.data.student.dateOfBirth && <tr className="border-b"><th className="py-1 font-semibold">D.O.B:</th><td className="py-1">{formatDate(report.data.student.dateOfBirth)}</td></tr>}
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {config.showAcademicYear && <tr className="border-b"><th className="py-1 font-semibold w-1/3">Academic Year:</th><td className="py-1">{selectedYear?.name}</td></tr>}
                  {config.showTerm && <tr className="border-b"><th className="py-1 font-semibold">Term:</th><td className="py-1">{selectedTerm?.name}</td></tr>}
                  {config.showTermDates && selectedTerm && <tr className="border-b"><th className="py-1 font-semibold">Term Dates:</th><td className="py-1">{formatDate(selectedTerm.startDate)} - {formatDate(selectedTerm.endDate)}</td></tr>}
                  {config.showReportIssueDate && <tr className="border-b"><th className="py-1 font-semibold">Issue Date:</th><td className="py-1">{formatDate(new Date().toString())}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {/* Overall Summary & Attendance (Compact) */}
          <section className="mt-6 flex flex-row gap-6 text-sm">
            {config.showAttendance && (
              <div className="flex-1 border border-black">
                <h3 className="bg-black text-white px-2 py-1 font-bold text-center uppercase text-xs tracking-wider">Attendance</h3>
                <div className="grid grid-cols-4 divide-x divide-black text-center">
                  <div className="p-1"><div className="text-[10px] uppercase font-bold">Present</div><div>{report.data.attendance.present}</div></div>
                  <div className="p-1"><div className="text-[10px] uppercase font-bold">Absent</div><div>{report.data.attendance.absent}</div></div>
                  <div className="p-1"><div className="text-[10px] uppercase font-bold">Late</div><div>{report.data.attendance.late}</div></div>
                  <div className="p-1"><div className="text-[10px] uppercase font-bold">Excused</div><div>{report.data.attendance.excused}</div></div>
                </div>
              </div>
            )}
            {config.showOverallAverage && (
              <div className="flex-1 border border-black">
                <h3 className="bg-black text-white px-2 py-1 font-bold text-center uppercase text-xs tracking-wider">Overall Performance</h3>
                <div className="p-2 text-center text-xl font-bold">
                  {overallAvg !== undefined ? `${overallAvg}%` : "Pending"}
                </div>
              </div>
            )}
          </section>

          {/* Academic Results Table */}
          <section className="mt-6 flex-grow">
            <table className="w-full text-sm border-collapse border border-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black p-2 text-left w-1/3">Subject</th>
                  {config.showAssessmentBreakdown && <th className="border border-black p-2 text-center">Assessments</th>}
                  {config.showSubjectTotals && <th className="border border-black p-2 text-center">Total (%)</th>}
                  {config.showGrades && <th className="border border-black p-2 text-center">Grade</th>}
                  {config.showGradePoints && <th className="border border-black p-2 text-center">GP</th>}
                  {config.showRemarks && <th className="border border-black p-2 text-left">Remark</th>}
                </tr>
              </thead>
              <tbody>
                {report.data.subjects.map((subject) => (
                  <tr key={subject.subjectId}>
                    <td className="border border-black p-2 font-semibold">{subject.subjectName}</td>
                    {config.showAssessmentBreakdown && (
                      <td className="border border-black p-1">
                        <div className="flex flex-col gap-1 text-xs">
                          {subject.assessments.map(a => (
                            <div key={a.assessmentId} className="flex justify-between border-b border-gray-200 last:border-0 pb-1">
                              <span className="truncate max-w-[80px]" title={a.title}>{a.title}:</span>
                              <span>{a.percentage !== undefined ? `${a.percentage}%` : '-'}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    )}
                    {config.showSubjectTotals && <td className="border border-black p-2 text-center font-bold">{subject.isComplete ? subject.totalPercentage : '-'}</td>}
                    {config.showGrades && <td className="border border-black p-2 text-center font-bold">{subject.isComplete ? subject.grade : '-'}</td>}
                    {config.showGradePoints && <td className="border border-black p-2 text-center">{subject.isComplete ? subject.gradePoint : '-'}</td>}
                    {config.showRemarks && <td className="border border-black p-2 text-xs">{subject.isComplete ? subject.remark : 'Result pending completion'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Comments & Promotion Section */}
          <section className="mt-8 grid grid-cols-2 gap-8 text-sm">
            {config.showClassTeacherComment && (
              <div>
                <h4 className="font-bold border-b border-black pb-1">Class Teacher&apos;s Report</h4>
                <p className="mt-2 italic min-h-[3rem] text-gray-700">
                  {report.data.comments?.classTeacher || "No comment provided yet."}
                </p>
                {config.showSignatureAreas && (
                  <div className="mt-4 pt-4 border-t border-black border-dashed w-48">
                    <span className="text-xs uppercase">Class Teacher Signature</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-6">
              {config.showHeadTeacherComment && (
                <div>
                  <h4 className="font-bold border-b border-black pb-1">Principal&apos;s / Head&apos;s Report</h4>
                  <p className="mt-2 italic min-h-[3rem] text-gray-700">
                    {report.data.comments?.headTeacher || "No comment provided yet."}
                  </p>
                  {config.showSignatureAreas && (
                    <div className="mt-4 pt-4 border-t border-black border-dashed w-48">
                      <span className="text-xs uppercase">Principal Signature</span>
                    </div>
                  )}
                </div>
              )}
              
              {config.showPromotionStatus && report.data.promotion && (
                <div className="bg-gray-100 p-3 border border-black">
                  <h4 className="font-bold text-xs uppercase mb-1">Promotion Status</h4>
                  <p className="font-bold">{report.data.promotion.decision === 'PROMOTE' ? 'Promoted to Next Class' : report.data.promotion.decision === 'RETAIN' ? 'Retained in Current Class' : report.data.promotion.decision}</p>
                </div>
              )}
            </div>
          </section>

          {/* Footer */}
          {config.footerText && (
            <footer className="mt-auto pt-8 pb-2 text-center text-xs text-gray-500 border-t border-gray-300">
              {config.footerText}
            </footer>
          )}
        </article>
      )}
    </div>
  );
}















