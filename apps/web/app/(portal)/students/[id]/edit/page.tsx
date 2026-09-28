"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { useStudent, useUpdateStudent } from "@/hooks/use-students";
import type { StudentRecord } from "@/lib/functional/types";
import { useSchoolClasses } from "@/lib/api/academic";
import { useUsers } from "@/lib/api/users";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";

export default function EditStudentPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const studentQuery = useStudent(id);
  if (studentQuery.isLoading) return <LoadingPage />;
  if (studentQuery.isError || !studentQuery.data) return <PageShell title="Edit student" permission={permissions.studentsManage}><EmptyState title="Student not found" description="This student record could not be loaded." /></PageShell>;
  return <StudentEditForm id={id} student={studentQuery.data} />;
}

function StudentEditForm({ id, student }: { id: string; student: StudentRecord }) {
  const router = useRouter();
  const classes = useSchoolClasses();
  const users = useUsers();
  const updateStudent = useUpdateStudent(id);
  const [data, setData] = useState({ firstName: student.firstName, middleName: student.middleName ?? "", lastName: student.lastName, dateOfBirth: student.dateOfBirth, gender: student.gender ?? "", guardianId: student.guardianId, currentClassId: student.currentClassId });
  const update = (key: keyof typeof data, value: string) => setData((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await updateStudent.mutateAsync(data); toast.success("Student updated successfully."); router.push(`/students/${id}`); }
    catch { toast.error("Student could not be updated. Please check the selected guardian and class."); }
  };
  return <PageShell title="Edit student" breadcrumbs={[{ label: "Students", href: "/students" }, { label: "Student", href: `/students/${id}` }, { label: "Edit" }]} permission={permissions.studentsManage}>
    <Card className="max-w-3xl"><CardContent className="pt-6"><form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">First name<Input required value={data.firstName} onChange={(e) => update("firstName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Middle name<Input value={data.middleName} onChange={(e) => update("middleName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Last name<Input required value={data.lastName} onChange={(e) => update("lastName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Date of birth<Input required type="date" value={data.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Gender<Input value={data.gender} onChange={(e) => update("gender", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Parent or guardian<select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.guardianId} onChange={(e) => update("guardianId", e.target.value)}>{users.data?.filter((user) => user.role === "PARENT").map((parent) => <option key={parent.id} value={parent.id}>{parent.firstName} {parent.lastName} · {parent.email}</option>)}</select></label>
        <label className="space-y-2 text-sm">Class<select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.currentClassId} onChange={(e) => update("currentClassId", e.target.value)}>{classes.data?.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select></label>
      </div>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.back()} disabled={updateStudent.isPending}>Cancel</Button><Button type="submit" disabled={updateStudent.isPending}>{updateStudent.isPending ? "Saving..." : "Save changes"}</Button></div>
    </form></CardContent></Card>
  </PageShell>;
}
