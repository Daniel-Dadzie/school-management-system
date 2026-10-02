"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import PageShell from "@/components/layout/page-shell";
import { LoadingPage } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { permissions } from "@/lib/authorization/permissions";
import { useAuthStore } from "@/stores/auth-store";
import { useStudents } from "@/lib/api/students";
import {
  useAccessibleTerms,
  useEnrollments,
  useSchoolClasses,
  useSubjects,
  useTeacherAssignments,
} from "@/lib/api/academic";
import {
  useAttendanceForClassDate,
  useSubmitAttendance,
  useUpdateAttendanceStatus,
  type AttendanceStatus,
} from "@/lib/api/attendance";

export default function TakeAttendance() {
  const user = useAuthStore((state) => state.user);
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRosterVisible, setIsRosterVisible] = useState(false);
  const [statusChanges, setStatusChanges] = useState<Record<string, AttendanceStatus>>({});

  const isTeacher = user?.role === "TEACHER";
  const assignments = useTeacherAssignments(!isTeacher);
  const classes = useSchoolClasses();
  const subjects = useSubjects();
  const terms = useAccessibleTerms();
  const students = useStudents();
  const enrollments = useEnrollments(!isTeacher);
  const attendance = useAttendanceForClassDate(termId, classId, subjectId, date, isRosterVisible);
  const submitAttendance = useSubmitAttendance();
  const updateAttendanceStatus = useUpdateAttendanceStatus();

  const availableTermIds = useMemo(
    () => new Set((assignments.data ?? []).map((assignment) => assignment.termId)),
    [assignments.data],
  );
  const availableTerms = (terms.data ?? []).filter((term) => availableTermIds.has(term.id));
  const selectedTermId = availableTerms.some((term) => term.id === termId) ? termId : availableTerms[0]?.id ?? "";
  const selectedAssignments = (assignments.data ?? []).filter((assignment) => assignment.termId === selectedTermId);
  const availableClasses = (classes.data ?? []).filter((schoolClass) =>
    selectedAssignments.some((assignment) => assignment.schoolClassId === schoolClass.id),
  );
  const selectedClassId = availableClasses.some((item) => item.id === classId) ? classId : availableClasses[0]?.id ?? "";
  const availableSubjects = (subjects.data ?? []).filter((subject) =>
    selectedAssignments.some((assignment) => assignment.schoolClassId === selectedClassId && assignment.subjectId === subject.id),
  );
  const selectedSubjectId = availableSubjects.some((item) => item.id === subjectId) ? subjectId : availableSubjects[0]?.id ?? "";
  const activeAssignment = selectedAssignments.find((assignment) =>
    assignment.schoolClassId === selectedClassId && assignment.subjectId === selectedSubjectId,
  );

  const roster = (students.data ?? []).filter((student) => {
    if (student.tenantId !== user?.tenantId || student.currentClassId !== selectedClassId || student.status !== "ACTIVE") return false;
    if (isTeacher) return true;
    return (enrollments.data ?? []).some((enrollment) =>
      enrollment.studentId === student.id && enrollment.schoolClassId === selectedClassId &&
      enrollment.academicYearId === activeAssignment?.academicYearId && enrollment.status === "ACTIVE",
    );
  });
  const existingRecords = attendance.data ?? [];
  const isLoading = assignments.isLoading || classes.isLoading || subjects.isLoading || terms.isLoading || students.isLoading || enrollments.isLoading || attendance.isLoading;
  const isError = assignments.isError || classes.isError || subjects.isError || terms.isError || students.isError || enrollments.isError || attendance.isError;
  const isSaving = submitAttendance.isPending || updateAttendanceStatus.isPending;

  const loadRoster = () => {
    setStatusChanges({});
    setIsRosterVisible(true);
  };

  const saveAttendance = async () => {
    const newRecords = roster.flatMap((student) => {
      const status = statusChanges[student.id] ?? existingRecords.find((record) => record.studentId === student.id)?.status;
      const exists = existingRecords.some((record) => record.studentId === student.id);
      return !exists && status ? [{ studentId: student.id, status }] : [];
    });
    const updates = roster.flatMap((student) => {
      const existing = existingRecords.find((record) => record.studentId === student.id);
      const status = statusChanges[student.id];
      return existing && status && status !== existing.status ? [{ id: existing.id, status }] : [];
    });

    try {
      if (newRecords.length > 0) {
        await submitAttendance.mutateAsync({
          termId: selectedTermId,
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          attendanceDate: date,
          records: newRecords,
        });
      }
      for (const update of updates) await updateAttendanceStatus.mutateAsync(update);
      if (newRecords.length === 0 && updates.length === 0) {
        toast.error("Choose an attendance status before saving.");
        return;
      }
      setStatusChanges({});
      toast.success("Attendance saved successfully.");
    } catch {
      toast.error("Unable to save all attendance records. Refresh the list and review the current statuses.");
    }
  };

  return (
    <PageShell title="Take Attendance" breadcrumbs={[{ label: "Attendance", href: "/attendance" }, { label: "Take Attendance" }]} permission={permissions.attendanceRecord}>
      {isLoading ? <LoadingPage /> : isError ? (
        <p role="alert" className="rounded-md border border-destructive p-4 text-sm text-destructive">Attendance data could not be loaded. Please try again.</p>
      ) : availableTerms.length === 0 ? (
        <EmptyState title="No assigned classes" description="There are no active class assignments available for attendance." icon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />} />
      ) : (
        <div className="space-y-6">
          <section className="rounded-md border bg-card p-4">
            <p className="mb-4 text-sm text-muted-foreground">Select an assigned class, subject, and term to record attendance.</p>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <label className="grid gap-1 text-sm font-medium">Date
                <input aria-label="Attendance date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setIsRosterVisible(false); }} className="rounded-md border bg-background p-2" />
              </label>
              <label className="grid gap-1 text-sm font-medium">Term
                <select aria-label="Term" value={selectedTermId} onChange={(event) => { setTermId(event.target.value); setIsRosterVisible(false); }} className="rounded-md border bg-background p-2">
                  {availableTerms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">Class
                <select aria-label="Class" value={selectedClassId} onChange={(event) => { setClassId(event.target.value); setIsRosterVisible(false); }} className="rounded-md border bg-background p-2">
                  {availableClasses.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">Subject
                <select aria-label="Subject" value={selectedSubjectId} onChange={(event) => { setSubjectId(event.target.value); setIsRosterVisible(false); }} className="rounded-md border bg-background p-2">
                  {availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
            </div>
            <Button onClick={loadRoster} disabled={!selectedTermId || !selectedClassId || !selectedSubjectId || !date}>Load Students</Button>
          </section>

          {isRosterVisible && (roster.length === 0 ? (
            <EmptyState title="No active students in this class" description="Only students with active enrollments can be marked present or absent." icon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />} />
          ) : (
            <section className="space-y-4 rounded-md border bg-card p-4">
              <h2 className="font-semibold">Attendance roster</h2>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 text-left"><th className="p-3">Student</th><th className="p-3">Status</th></tr></thead>
                  <tbody>
                    {roster.map((student) => {
                      const existing = existingRecords.find((record) => record.studentId === student.id);
                      const value = statusChanges[student.id] ?? existing?.status ?? "";
                      return <tr key={student.id} className="border-b last:border-0">
                        <td className="p-3">{student.firstName} {student.lastName}</td>
                        <td className="p-3">
                          <select aria-label={`Attendance status for ${student.firstName} ${student.lastName}`} value={value} onChange={(event) => setStatusChanges((current) => ({ ...current, [student.id]: event.target.value as AttendanceStatus }))} className="rounded-md border bg-background p-2">
                            <option value="">Choose status</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                            <option value="EXCUSED">Excused</option>
                          </select>
                          {existing && <span className="ml-2 text-xs text-muted-foreground">Previously recorded</span>}
                        </td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end"><Button onClick={() => void saveAttendance()} disabled={isSaving || roster.some((student) => !(statusChanges[student.id] ?? existingRecords.find((record) => record.studentId === student.id)?.status))}>{isSaving ? "Saving..." : "Save Attendance"}</Button></div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
