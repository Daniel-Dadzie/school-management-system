"use client";

import PageShell from "@/components/layout/page-shell";
import { permissions } from "@/lib/authorization/permissions";
import { StudentsTable } from "./students-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { hasPermission } from "@/lib/authorization/permissions";

export default function StudentsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canManage = hasPermission(role, permissions.studentsManage);
  return (
    <PageShell title="Students" description="Manage student records and enrollments." breadcrumbs={[{ label: "Students" }]} permission={permissions.studentsView} actions={canManage ? <Button asChild><Link href="/students/new"><Plus className="mr-2 h-4 w-4" />Add student</Link></Button> : undefined}>
      <StudentsTable />
    </PageShell>
  );
}
