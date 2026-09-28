"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser, useSetUserActive, useUserActivity } from "@/lib/api/users";
import { useStudents } from "@/lib/api/students";
import { useSchoolClasses, useSubjects, useTeacherAssignments } from "@/lib/api/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { toast } from "sonner";

export function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading, isError } = useUser(id);
  const activity = useUserActivity(id);
  const students = useStudents();
  const classes = useSchoolClasses();
  const subjects = useSubjects();
  const assignments = useTeacherAssignments();
  const statusMutation = useSetUserActive(id);
  const [confirmStatus, setConfirmStatus] = useState(false);

  if (isLoading) return <div className="flex h-64 flex-col items-center justify-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Loading user details...</p></div>;
  if (isError || !user) return <EmptyState title="User not found" description="This user could not be found." action={<Button asChild><Link href="/users">Back to users</Link></Button>} />;

  const updateStatus = async () => {
    try {
      await statusMutation.mutateAsync(user.status !== "ACTIVE");
      toast.success(user.status === "ACTIVE" ? "User deactivated successfully." : "User activated successfully.");
      setConfirmStatus(false);
    } catch {
      toast.error("User status could not be updated.");
    }
  };
  const displayDate = (value?: string) => value ? new Date(value).toLocaleDateString() : "Not available";

  return <div className="space-y-4">
    <div className="flex flex-wrap justify-end gap-2">
      <Button asChild variant="outline"><Link href={`/users/${id}/edit`}>Edit user</Link></Button>
      <Button variant={user.status === "ACTIVE" ? "destructive" : "default"} disabled={statusMutation.isPending} onClick={() => setConfirmStatus(true)}>{statusMutation.isPending ? "Saving..." : user.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Account information</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
        <p><span className="text-muted-foreground">Username</span><br /><span className="font-medium">{user.username}</span></p>
        <p><span className="text-muted-foreground">Email</span><br /><span className="font-medium">{user.email}</span></p>
        <p><span className="text-muted-foreground">Role</span><br /><span className="font-medium">{user.role}</span></p>
        <p><span className="text-muted-foreground">Status</span><br /><span className="font-medium">{user.status}</span></p>
        <p><span className="text-muted-foreground">Created</span><br /><span className="font-medium">{displayDate(user.createdAt)}</span></p>
        <p><span className="text-muted-foreground">Last login</span><br /><span className="font-medium">{displayDate(user.lastLoginAt)}</span></p>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Personal information</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
        <p><span className="text-muted-foreground">Name</span><br /><span className="font-medium">{[user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || "Not provided"}</span></p>
        <p><span className="text-muted-foreground">Preferred name</span><br /><span className="font-medium">{user.preferredName || "Not provided"}</span></p>
        <p><span className="text-muted-foreground">Phone</span><br /><span className="font-medium">{user.phone || "Not provided"}</span></p>
        <p><span className="text-muted-foreground">Address</span><br /><span className="font-medium">{user.address || "Not provided"}</span></p>
        {user.role === "TEACHER" && <><p><span className="text-muted-foreground">Staff ID</span><br /><span className="font-medium">{user.teacherProfile?.staffId ?? "Not assigned"}</span></p><p><span className="text-muted-foreground">Qualification</span><br /><span className="font-medium">{user.teacherProfile?.qualification ?? "Not provided"}</span></p><p><span className="text-muted-foreground">Specialization</span><br /><span className="font-medium">{user.teacherProfile?.specialization ?? "Not provided"}</span></p></>}
      </CardContent></Card>
    </div>
    {user.role === "TEACHER" && <Card><CardHeader><CardTitle>Teaching assignments</CardTitle></CardHeader><CardContent>
      {assignments.isLoading ? <p className="text-sm text-muted-foreground">Loading assignments...</p> : assignments.isError ? <p role="alert" className="text-sm text-destructive">Assignments could not be loaded.</p> : (assignments.data ?? []).filter((item) => item.teacherId === user.id).length === 0 ? <p className="text-sm text-muted-foreground">No teaching assignments found.</p> : <ul className="divide-y">{(assignments.data ?? []).filter((item) => item.teacherId === user.id).map((assignment) => <li key={assignment.id} className="py-3 text-sm">{classes.data?.find((item) => item.id === assignment.schoolClassId)?.name ?? "Class unavailable"} · {subjects.data?.find((item) => item.id === assignment.subjectId)?.name ?? "Subject unavailable"} · {assignment.status}</li>)}</ul>}
    </CardContent></Card>}
    {user.role === "PARENT" && <Card><CardHeader><CardTitle>Linked children</CardTitle></CardHeader><CardContent>
      {students.isLoading ? <p className="text-sm text-muted-foreground">Loading students...</p> : students.isError ? <p role="alert" className="text-sm text-destructive">Linked children could not be loaded.</p> : (students.data ?? []).filter((item) => item.guardianId === user.id).length === 0 ? <p className="text-sm text-muted-foreground">No linked children found.</p> : <ul className="divide-y">{(students.data ?? []).filter((item) => item.guardianId === user.id).map((child) => <li key={child.id} className="py-3"><Link className="text-primary underline" href={`/students/${child.id}`}>{child.firstName} {child.lastName}</Link></li>)}</ul>}
    </CardContent></Card>}
    <Card><CardHeader><CardTitle>Activity</CardTitle></CardHeader><CardContent>
      {activity.isLoading ? <p className="text-sm text-muted-foreground">Loading activity...</p> : activity.isError ? <p role="alert" className="text-sm text-destructive">Activity could not be loaded.</p> : activity.data?.length ? <ul className="divide-y">{activity.data.map((event) => <li key={event.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{event.action} · {event.entityType}</span><time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time></li>)}</ul> : <p className="text-sm text-muted-foreground">No activity recorded.</p>}
    </CardContent></Card>
    <ConfirmationDialog open={confirmStatus} onOpenChange={setConfirmStatus} title={user.status === "ACTIVE" ? "Deactivate user?" : "Activate user?"} description={user.status === "ACTIVE" ? "This user will no longer be able to sign in." : "This user will be able to sign in again."} confirmText={user.status === "ACTIVE" ? "Deactivate" : "Activate"} destructive={user.status === "ACTIVE"} confirmDisabled={statusMutation.isPending} onConfirm={updateStatus} />
  </div>;
}
