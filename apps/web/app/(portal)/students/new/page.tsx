"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStudent } from "@/hooks/use-students";
import { useSchoolClasses } from "@/lib/api/academic";
import { useUsers } from "@/lib/api/users";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";

export default function NewStudentPage() {
  const router = useRouter();
  const create = useCreateStudent();
  const classes = useSchoolClasses();
  const users = useUsers();
  const [data, setData] = useState({ firstName: "", middleName: "", lastName: "", dateOfBirth: "", gender: "", guardianId: "", currentClassId: "" });
  const update = (key: keyof typeof data, value: string) => setData((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const student = await create.mutateAsync(data);
      toast.success("Student created successfully.");
      router.push(`/students/${student.id}`);
    } catch {
      toast.error("Student could not be created. Check the selected guardian and class.");
    }
  };
  const parents = users.data?.filter((user) => user.role === "PARENT") ?? [];
  return <PageShell title="Add student" description="Create a student record and initial enrollment." breadcrumbs={[{ label: "Students", href: "/students" }, { label: "Add student" }]} permission={permissions.studentsManage}>
    <Card className="max-w-3xl"><CardContent className="pt-6">
      {(classes.isError || users.isError) && <p role="alert" className="mb-4 text-sm text-destructive">Student form options could not be loaded. Please retry.</p>}
      <form onSubmit={submit} className="space-y-5">
        <section className="space-y-4"><h2 className="font-semibold">Personal information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">First name<Input required value={data.firstName} onChange={(e) => update("firstName", e.target.value)} /></label>
            <label className="space-y-2 text-sm">Middle name<Input value={data.middleName} onChange={(e) => update("middleName", e.target.value)} /></label>
            <label className="space-y-2 text-sm">Last name<Input required value={data.lastName} onChange={(e) => update("lastName", e.target.value)} /></label>
            <label className="space-y-2 text-sm">Date of birth<Input required type="date" value={data.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></label>
            <label className="space-y-2 text-sm">Gender<Input value={data.gender} onChange={(e) => update("gender", e.target.value)} /></label>
          </div>
        </section>
        <section className="space-y-4"><h2 className="font-semibold">Guardian and enrollment</h2><div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">Parent or guardian<select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.guardianId} onChange={(e) => update("guardianId", e.target.value)}><option value="">Select a parent</option>{parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.firstName} {parent.lastName} · {parent.email}</option>)}</select></label>
          <label className="space-y-2 text-sm">Class<select required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.currentClassId} onChange={(e) => update("currentClassId", e.target.value)}><option value="">Select a class</option>{classes.data?.map((schoolClass) => <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>)}</select></label>
        </div></section>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.back()} disabled={create.isPending}>Cancel</Button><Button type="submit" disabled={create.isPending || classes.isLoading || users.isLoading}>{create.isPending ? "Creating..." : "Create student"}</Button></div>
      </form>
    </CardContent></Card>
  </PageShell>;
}
