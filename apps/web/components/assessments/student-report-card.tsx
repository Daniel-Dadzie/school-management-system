"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAssessmentReferences, usePublishReportCard, useStudentReportCard } from "@/hooks/use-assessments";
import { useStudent } from "@/hooks/use-students";
import { useReportCardConfig, useSettings, type ReportCardConfigResponse } from "@/lib/api/settings";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { ForbiddenState } from "@/components/ui/forbidden-state";
import { AssessmentDomainError } from "@/lib/functional/errors/assessment-domain-error";
const formatDate = (dateStr: string) => { try { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr)); } catch { return dateStr; } };
import styles from "./student-report-card.module.css";
import Image from "next/image";
import { EditReportCardComments } from "@/components/assessments/edit-report-card-comments";
import { hasPermission, permissions } from "@/lib/authorization/permissions";

import { useAuthStore } from "@/stores/auth-store";

const defaultReportCardConfig: ReportCardConfigResponse = {
  id: "default",
  showLogo: true,
  showWatermark: true,
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


export function StudentReportCard({ studentId, title = "Student result", isParentView = false, academicYearId, termId: initialTermId }: { studentId: string; title?: string; isParentView?: boolean; academicYearId?: string; termId?: string }) {
  const userRole = useAuthStore((state) => state.user)?.role;
  const references = useAssessmentReferences();
  const studentQuery = useStudent(studentId);
  const settingsQuery = useSettings();
  const reportCardConfigQuery = useReportCardConfig();
  
  const years = references.data?.academicYears ?? [];
  const [selectedYearId, setSelectedYearId] = useState("");
  const yearId = selectedYearId || academicYearId || years[0]?.id || "";
  
  const terms = useMemo(() => references.data?.terms.filter((term) => term.academicYearId === yearId) ?? [], [references.data?.terms, yearId]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const termId = terms.some((term) => term.id === selectedTermId) ? selectedTermId : initialTermId && terms.some((term) => term.id === initialTermId) ? initialTermId : terms[0]?.id ?? "";
  
  const report = useStudentReportCard(studentId, yearId, termId);
  const publishReportCard = usePublishReportCard();
  
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
  const config = reportCardConfigQuery.data ?? defaultReportCardConfig;
  const canPublish = !isParentView && userRole === "ADMIN";

  const handlePublish = async () => {
    if (!yearId || !termId || report.data?.comments?.status === "PUBLISHED") return;
    try {
      await publishReportCard.mutateAsync({ studentId, academicYearId: yearId, termId });
      toast.success("Report card published successfully");
    } catch {
      toast.error("Unable to publish report card");
    }
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
        {canPublish && report.data && report.data.comments?.status !== "PUBLISHED" && (
          <button type="button" onClick={handlePublish} disabled={publishReportCard.isPending} className="h-9 rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {publishReportCard.isPending ? "Publishing..." : "Publish Report Card"}
          </button>
        )}
        <div className="flex gap-2 print:hidden">
          <button type="button" onClick={() => window.print()} className="h-9 rounded-md border bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Print</button>
          {isParentView && (
             <button type="button" onClick={() => toast.info("PDF generation will be supported in a future update.", { description: "You can use the Print button to save as PDF for now." })} className="h-9 rounded-md border bg-secondary text-secondary-foreground px-4 text-sm font-medium hover:bg-secondary/90 focus-visible:outline-none">
               Download PDF
             </button>
          )}
        </div>
      </div>

      {references.isLoading || studentQuery.isLoading || settingsQuery.isLoading || reportCardConfigQuery.isLoading || (Boolean(yearId && termId) && report.isLoading) ? (
        <div role="status" className="flex min-h-[400px] items-center justify-center rounded-lg border bg-card"><LoadingSpinner /><span className="ml-2 text-sm text-muted-foreground">Generating {title.toLowerCase()}...</span></div>
      ) : forbidden ? (
        <ForbiddenState title="Results access denied" />
      ) : studentQuery.isError || references.isError || report.isError || settingsQuery.isError || reportCardConfigQuery.isError ? (
        <ErrorState title="Unable to load results" description="Refresh to try loading the selected academic record." onRetry={() => { void references.refetch(); void studentQuery.refetch(); void report.refetch(); void settingsQuery.refetch(); void reportCardConfigQuery.refetch(); }} />
      ) : !studentQuery.data ? (
        <p className="rounded-lg border p-5 text-sm bg-card">Student not found.</p>
      ) : !yearId || !termId ? (
        <p className="rounded-lg border p-5 text-sm bg-card">No academic term is available.</p>
      ) : !report.data?.subjects.length ? (
        <p className="rounded-lg border p-5 text-sm bg-card">No assessment results exist for this student and term.</p>
      ) : (
        <article data-report-card-print-root className={`${styles.printRoot} ${styles.screenRoot} relative flex flex-col mx-auto max-w-4xl overflow-hidden bg-white text-black min-h-[297mm] p-[16mm] shadow-sm print:shadow-none`}>
          {config.showWatermark && config.showLogo && settings?.logoUrl && (
            <div className={styles.watermark} aria-hidden="true">
              <Image src={settings.logoUrl} alt="" fill className="object-contain" />
            </div>
          )}
          <div className="relative z-10 flex min-h-full flex-col">
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
            {config.showSchoolAddress && settings?.address && <p className="mt-1 text-xs">{settings.address}</p>}
            <h2 className="mt-6 text-xl font-bold uppercase border border-black px-4 py-1 inline-block">Termly Academic Report</h2>
          </header>

          {/* Student & Period Information */}
          <section className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
            <div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b"><th className="py-1 font-semibold w-1/3">Name:</th><td className="py-1 font-bold uppercase">{report.data.student.firstName} {report.data.student.middleName ? `${report.data.student.middleName} ` : ""}{report.data.student.lastName}</td></tr>
                  {config.showStudentId && <tr className="border-b"><th className="py-1 font-semibold">Student ID:</th><td className="py-1">{report.data.student.studentId ?? report.data.student.id}</td></tr>}
                  {config.showClass && <tr className="border-b"><th className="py-1 font-semibold">Class:</th><td className="py-1">{schoolClass?.name}</td></tr>}
                  {config.showGender && <tr className="border-b"><th className="py-1 font-semibold">Gender:</th><td className="py-1">{report.data.student.gender === 'M' ? 'Male' : report.data.student.gender === 'F' ? 'Female' : report.data.student.gender}</td></tr>}
                  {config.showDateOfBirth && report.data.student.dateOfBirth && <tr className="border-b"><th className="py-1 font-semibold">D.O.B:</th><td className="py-1">{formatDate(report.data.student.dateOfBirth)}</td></tr>}
                </tbody>
              </table>
            </div>
            {config.showStudentPhoto && (
              <div className="flex items-center justify-center">
                {report.data.student.photoUrl ? (
                  <div className="relative h-28 w-24 overflow-hidden border border-black">
                    <Image src={report.data.student.photoUrl} alt={`${report.data.student.firstName} ${report.data.student.lastName}`} fill className="object-cover" />
                  </div>
                ) : <div className="flex h-28 w-24 items-center justify-center border border-dashed border-gray-400 text-center text-xs text-gray-500">Student photo</div>}
              </div>
            )}
            <div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  {config.showAcademicYear && <tr className="border-b"><th className="py-1 font-semibold w-1/3">Academic Year:</th><td className="py-1">{selectedYear?.name}</td></tr>}
                  {config.showTerm && <tr className="border-b"><th className="py-1 font-semibold">Term:</th><td className="py-1">{selectedTerm?.name}</td></tr>}
                  {config.showTermDates && selectedTerm && <tr className="border-b"><th className="py-1 font-semibold">Term Dates:</th><td className="py-1">{formatDate(selectedTerm.startDate)} - {formatDate(selectedTerm.endDate)}</td></tr>}
                  {config.showReportIssueDate && <tr className="border-b"><th className="py-1 font-semibold">Issue Date:</th><td className="py-1">{formatDate(report.data.comments?.publishedAt ?? new Date().toString())}</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-gray-300 py-2 text-xs">
            <span className="font-semibold uppercase tracking-wide">Report status: {report.data.comments?.status === "PUBLISHED" ? "Published" : "Draft"}</span>
            {report.data.comments?.publishedAt && <span>Published {formatDate(report.data.comments.publishedAt)}</span>}
          </section>

          {/* Overall Summary & Attendance (Compact) */}
          <section className="mt-6 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap">
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
            {config.showPosition && report.data.position && (
              <div className="flex-1 border border-black">
                <h3 className="bg-black px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-white">Class Position</h3>
                <div className="p-2 text-center text-xl font-bold">{report.data.position.rank} <span className="text-sm font-normal">of {report.data.position.total}</span></div>
              </div>
            )}
            {report.data.progress?.previousAverage !== undefined && (
              <div className="flex-1 border border-black">
                <h3 className="bg-black px-2 py-1 text-center text-xs font-bold uppercase tracking-wider text-white">Progress</h3>
                <div className="p-2 text-center font-bold">
                  {report.data.progress.currentAverage ?? "Pending"}% <span className="text-xs font-normal">from {report.data.progress.previousAverage}% prior term</span>
                </div>
              </div>
            )}
          </section>

          {/* Academic Results Table */}
          <section className="mt-6 flex-grow">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[36rem] text-sm border-collapse border border-black">
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
            </div>
            <div className="space-y-3 sm:hidden">
              {report.data.subjects.map((subject) => (
                <div key={subject.subjectId} className="border border-black p-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{subject.subjectName}</h3>
                    <span className="text-right font-bold">{subject.isComplete ? `${subject.totalPercentage}%` : "Pending"}{config.showGrades && subject.isComplete ? ` · ${subject.grade}` : ""}</span>
                  </div>
                  {config.showAssessmentBreakdown && <div className="mt-2 space-y-1 text-xs text-gray-700">{subject.assessments.map((assessment) => <div key={assessment.assessmentId} className="flex justify-between gap-2"><span>{assessment.title}</span><span>{assessment.percentage !== undefined ? `${assessment.percentage}%` : "-"}</span></div>)}</div>}
                  {(config.showGradePoints || config.showRemarks) && <div className="mt-2 border-t border-gray-300 pt-2 text-xs">{config.showGradePoints && <span>GP: {subject.isComplete ? subject.gradePoint : "-"}</span>}{config.showGradePoints && config.showRemarks && <span> · </span>}{config.showRemarks && <span>{subject.isComplete ? subject.remark : "Result pending completion"}</span>}</div>}
                </div>
              ))}
            </div>
          </section>

          {report.data.gradingScale && (
            <section className="mt-6 text-sm">
              <h3 className="border-b border-black pb-1 font-bold">Grading Scale: {report.data.gradingScale.name}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {report.data.gradingScale.bands.slice().sort((first, second) => first.sortOrder - second.sortOrder).map((band) => (
                  <div key={band.id} className="flex justify-between border-b border-gray-200 py-1"><span className="font-semibold">{band.grade}</span><span>{band.minimumPercentage}-{band.maximumPercentage}% · {band.remark}</span></div>
                ))}
              </div>
            </section>
          )}

          {/* Comments & Promotion Section */}
          <section className="mt-8 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
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
          </div>
        </article>
      )}
    </div>
  );
}














