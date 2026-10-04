"use client";

import PageShell from "@/components/layout/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { useMyProfile, useUpdateMyProfile } from "@/lib/api/users";
import { permissions } from "@/lib/authorization/permissions";
import { toast } from "sonner";

export default function MyProfilePage() {
  const profile = useMyProfile();
  const update = useUpdateMyProfile();
  if (profile.isLoading) return <PageShell title="My profile" permission={permissions.profileView}><LoadingPage /></PageShell>;
  if (profile.isError || !profile.data) return <PageShell title="My profile" permission={permissions.profileView}><ErrorState title="Profile unavailable" description="Your profile could not be loaded." onRetry={() => void profile.refetch()} /></PageShell>;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    try {
      await update.mutateAsync({ firstName: String(fields.get("firstName") ?? ""), middleName: String(fields.get("middleName") ?? ""), lastName: String(fields.get("lastName") ?? ""), preferredName: String(fields.get("preferredName") ?? ""), gender: String(fields.get("gender") ?? ""), dateOfBirth: String(fields.get("dateOfBirth") ?? ""), phone: String(fields.get("phone") ?? ""), address: String(fields.get("address") ?? "") });
      toast.success("Profile saved successfully.");
    } catch { toast.error("Profile could not be saved. Please try again."); }
  };
  const user = profile.data;
  return <PageShell title="My profile" description="Review and update your personal information." breadcrumbs={[{ label: "My profile" }]} permission={permissions.profileView}>
    <Card className="max-w-3xl"><CardContent className="pt-6"><form onSubmit={submit} className="space-y-5">
      <section className="space-y-4"><h2 className="font-semibold">Personal information</h2><div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm">First name<Input name="firstName" required defaultValue={user.firstName} /></label>
        <label className="space-y-2 text-sm">Middle name<Input name="middleName" defaultValue={user.middleName} /></label>
        <label className="space-y-2 text-sm">Last name<Input name="lastName" required defaultValue={user.lastName} /></label>
        <label className="space-y-2 text-sm">Preferred name<Input name="preferredName" defaultValue={user.preferredName} /></label>
        <label className="space-y-2 text-sm">Gender<Input name="gender" defaultValue={user.gender} /></label>
        <label className="space-y-2 text-sm">Date of birth<Input name="dateOfBirth" type="date" defaultValue={user.dateOfBirth} /></label>
        <label className="space-y-2 text-sm">Phone<Input name="phone" type="tel" defaultValue={user.phone} /></label>
        <label className="space-y-2 text-sm">Address<Input name="address" defaultValue={user.address} /></label>
      </div></section>
      <section className="space-y-4"><h2 className="font-semibold">Account information</h2><div className="grid gap-4 sm:grid-cols-2 text-sm"><p><span className="text-muted-foreground">Username</span><br />{user.username}</p><p><span className="text-muted-foreground">Email</span><br />{user.email}</p><p><span className="text-muted-foreground">Role</span><br />{user.role}</p></div></section>
      <div className="flex justify-end"><Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving..." : "Save profile"}</Button></div>
    </form></CardContent></Card>
  </PageShell>;
}
