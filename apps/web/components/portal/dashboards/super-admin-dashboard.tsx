import Link from "next/link";
import { Activity, BookOpen, CalendarCheck, ClipboardList, FileSpreadsheet, GraduationCap, Settings, Users } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const oversightLinks = [
  { title: "Users", description: "Manage system accounts and roles.", href: "/users", icon: Users },
  { title: "Students", description: "Review student records.", href: "/students", icon: GraduationCap },
  { title: "Enrollments", description: "Review school enrollment records.", href: "/enrollments", icon: ClipboardList },
  { title: "Admissions", description: "Review admissions activity.", href: "/admissions-admin", icon: ClipboardList },
  { title: "Academic configuration", description: "Review academic years, terms, classes, and subjects.", href: "/academic-setup", icon: BookOpen },
  { title: "Attendance", description: "Review attendance history and student records.", href: "/attendance/history", icon: CalendarCheck },
  { title: "Assessments", description: "Review assessment definitions and results.", href: "/assessments", icon: FileSpreadsheet },
  { title: "System status", description: "Check configured service integrations.", href: "/system-status", icon: Activity },
  { title: "Settings", description: "Manage school-level system settings.", href: "/settings", icon: Settings },
];

export function SuperAdminDashboard() {
  return (
    <section aria-label="System administration overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {oversightLinks.map(({ title, description, href, icon: Icon }) => (
        <Link key={href} href={href} className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Card className="h-full transition-colors hover:border-primary">
            <CardHeader>
              <Icon className="mb-2 h-8 w-8 text-primary" aria-hidden="true" />
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </section>
  );
}
