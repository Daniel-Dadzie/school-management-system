"use client";

import Link from "next/link";
import { useStudent } from "@/hooks/use-students";
import { useSchoolClasses } from "@/lib/api/academic";
import { useUsers } from "@/lib/api/users";
import { useAuthStore } from "@/stores/auth-store";
import { useAccessibleTerms } from "@/lib/api/academic";
import { useAttendanceForTerm } from "@/lib/api/attendance";
import { hasPermission, permissions } from "@/lib/authorization/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingPage } from "@/components/ui/loading";

export default function StudentDetail({ id }: { id: string }) {
  const studentQuery = useStudent(id);
  const classQuery = useSchoolClasses();
  const userQuery = useUsers();
  const terms = useAccessibleTerms();
  const attendance = useAttendanceForTerm(terms.data?.[0]?.id ?? "");
  const role = useAuthStore((state) => state.user?.role);
  const student = studentQuery.data;
  if (studentQuery.isLoading || terms.isLoading) return <LoadingPage />;
  if (studentQuery.isError || !student) return <EmptyState title="Student not found" description="This student record could not be loaded." action={<Button asChild><Link href="/students">Back to students</Link></Button>} />;
  const schoolClass = classQuery.data?.find((item) => item.id === student.currentClassId);
  const guardian = userQuery.data?.find((item) => item.id === student.guardianId);
  return <div className="space-y-4">
    {hasPermission(role, permissions.studentsManage) && <div className="flex justify-end"><Button asChild><Link href={`/students/${id}/edit`}>Edit student</Link></Button></div>}
    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Profile</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <p><span className="text-muted-foreground">Student ID</span><br />{student.studentId ?? "Not assigned"}</p>
        <p><span className="text-muted-foreground">Name</span><br />{[student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ")}</p>
        <p><span className="text-muted-foreground">Date of birth</span><br />{student.dateOfBirth}</p>
        <p><span className="text-muted-foreground">Gender</span><br />{student.gender || "Not provided"}</p>
        <p><span className="text-muted-foreground">Status</span><br />{student.status}</p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Enrollment and guardian</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
        <p><span className="text-muted-foreground">Class</span><br />{schoolClass?.name ?? "Class unavailable"}</p>
        <p><span className="text-muted-foreground">Enrollment status</span><br />{student.status}</p>
        <p><span className="text-muted-foreground">Guardian</span><br />{guardian ? `${guardian.firstName ?? ""} ${guardian.lastName ?? ""}`.trim() || guardian.email : "Linked guardian"}</p>
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Attendance</CardTitle></CardHeader><CardContent>
      {attendance.isLoading ? <p className="text-sm text-muted-foreground">Loading attendance...</p> : attendance.isError ? <p role="alert" className="text-sm text-destructive">Attendance could not be loaded.</p> : (attendance.data ?? []).filter((record) => record.studentId === student.id).length === 0 ? <p className="text-sm text-muted-foreground">No attendance records found.</p> : <ul className="divide-y">{(attendance.data ?? []).filter((record) => record.studentId === student.id).map((record) => <li key={record.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><time dateTime={record.attendanceDate}>{record.attendanceDate}</time><span>{record.status}</span></li>)}</ul>}
    </CardContent></Card>
  </div>;
}
