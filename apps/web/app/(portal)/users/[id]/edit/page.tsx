"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useUpdateUser, type Role } from "@/lib/api/users";
import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import type { UserResponse } from "@/lib/api/users";

type FormData = { username: string; email: string; role: Role; firstName: string; middleName: string; lastName: string; preferredName: string; gender: string; dateOfBirth: string; phone: string; address: string; teacherProfile: { staffId: string; qualification: string; specialization: string; employmentDate: string } };

export default function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const query = useUser(id);
  if (query.isLoading) return <LoadingPage />;
  if (query.isError || !query.data) return <PageShell title="Edit user" permission={permissions.usersManage}><EmptyState title="User not found" description="This user could not be loaded." /></PageShell>;
  return <UserEditForm id={id} user={query.data} />;
}

function UserEditForm({ id, user }: { id: string; user: UserResponse }) {
  const router = useRouter();
  const updateUser = useUpdateUser(id);
  const actorRole = useAuthStore((state) => state.user?.role);
  const [form, setForm] = useState<FormData>({ username: user.username, email: user.email, role: user.role, firstName: user.firstName ?? "", middleName: user.middleName ?? "", lastName: user.lastName ?? "", preferredName: user.preferredName ?? "", gender: user.gender ?? "", dateOfBirth: user.dateOfBirth ?? "", phone: user.phone ?? "", address: user.address ?? "", teacherProfile: { staffId: user.teacherProfile?.staffId ?? "", qualification: user.teacherProfile?.qualification ?? "", specialization: user.teacherProfile?.specialization ?? "", employmentDate: user.teacherProfile?.employmentDate ?? "" } });
  const change = (key: keyof Omit<FormData, "teacherProfile">, value: string) => setForm((current) => ({ ...current, [key]: key === "role" ? value as Role : value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await updateUser.mutateAsync(form); toast.success("User updated successfully."); router.push(`/users/${id}`); }
    catch { toast.error("User could not be updated. Check username, email, and role permissions."); }
  };
  return <PageShell title="Edit user" breadcrumbs={[{ label: "Users", href: "/users" }, { label: "User", href: `/users/${id}` }, { label: "Edit" }]} permission={permissions.usersManage}>
    <Card className="max-w-3xl"><CardContent className="pt-6"><form onSubmit={submit} className="space-y-5">
      <section className="space-y-4"><h2 className="font-semibold">Account</h2><div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">Username<Input required value={form.username} onChange={(e) => change("username", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Email<Input required type="email" value={form.email} onChange={(e) => change("email", e.target.value)} /></label>
        {actorRole === "SUPER_ADMIN" && <label className="space-y-2 text-sm">Role<select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={(e) => change("role", e.target.value)}><option value="SUPER_ADMIN">Super admin</option><option value="ADMIN">Admin</option><option value="TEACHER">Teacher</option><option value="PARENT">Parent</option></select></label>}
      </div></section>
      <section className="space-y-4"><h2 className="font-semibold">Personal information</h2><div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">First name<Input required value={form.firstName} onChange={(e) => change("firstName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Middle name<Input value={form.middleName} onChange={(e) => change("middleName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Last name<Input required value={form.lastName} onChange={(e) => change("lastName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Preferred name<Input value={form.preferredName} onChange={(e) => change("preferredName", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Phone<Input value={form.phone} onChange={(e) => change("phone", e.target.value)} /></label>
        <label className="space-y-2 text-sm">Address<Input value={form.address} onChange={(e) => change("address", e.target.value)} /></label>
      </div></section>
      {form.role === "TEACHER" && <section className="space-y-4"><h2 className="font-semibold">Teacher information</h2><div className="grid gap-4 sm:grid-cols-2">
        {(["staffId", "qualification", "specialization", "employmentDate"] as const).map((key) => <label key={key} className="space-y-2 text-sm">{key === "staffId" ? "Staff ID" : key === "employmentDate" ? "Employment date" : key[0].toUpperCase() + key.slice(1)}<Input type={key === "employmentDate" ? "date" : "text"} required={key === "staffId"} value={form.teacherProfile[key]} onChange={(event) => setForm((current) => ({ ...current, teacherProfile: { ...current.teacherProfile, [key]: event.target.value } }))} /></label>)}
      </div></section>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.back()} disabled={updateUser.isPending}>Cancel</Button><Button type="submit" disabled={updateUser.isPending}>{updateUser.isPending ? "Saving..." : "Save changes"}</Button></div>
    </form></CardContent></Card>
  </PageShell>;
}
