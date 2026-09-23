"use client";

import Link from "next/link";
import {
  Calendar,
  Building2,
  BookOpen,
  UserCheck,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  Plus,
  Sparkles,
} from "lucide-react";

import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { useAuthStore } from "@/stores/auth-store";
import {
  useAcademicYears,
  useSchoolClasses,
  useSubjects,
  useTeacherAssignments,
  useEnrollments,
} from "@/lib/api/academic";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === "TEACHER";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const { data: academicYears } = useAcademicYears();
  const { data: classes, isLoading: isClassesLoading } = useSchoolClasses();
  const { data: subjects, isLoading: isSubjectsLoading } = useSubjects();
  const { data: assignments, isLoading: isAssignmentsLoading } = useTeacherAssignments(isTeacher);
  const { data: enrollments, isLoading: isEnrollmentsLoading } = useEnrollments();

  const activeYear = academicYears?.find((y) => y.status === "ACTIVE") || academicYears?.[0];

  return (
    <PageShell
      title={`Welcome back, ${user?.username || "Educator"}`}
      description="Operational overview of CarePoint Community School management system."
      breadcrumbs={[
        { label: "Home", href: "/dashboard" },
        { label: "Dashboard" },
      ]}
      actions={
        isAdmin ? (
          <Button asChild>
            <Link href="/academics" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Academic Setup</span>
            </Link>
          </Button>
        ) : undefined
      }
    >
      {/* Top Banner */}
      <div className="rounded-xl border bg-primary/5 p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
              {activeYear ? `Academic Year: ${activeYear.name}` : "Session Active"}
            </Badge>
            <Badge variant="secondary" className="text-xs uppercase font-mono">
              {user?.role.replace("_", " ") || "STAFF"}
            </Badge>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            CarePoint Community School Management Portal
          </h2>
          <p className="text-xs text-muted-foreground">
            All academic business rules, attendance records, and student data are actively synchronized.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/system-status" className="gap-1.5 text-xs">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Check System Status</span>
          </Link>
        </Button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Classes Metric */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Classes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isClassesLoading ? (
              <LoadingSpinner className="h-5 w-5 text-primary my-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {classes?.length ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Active grade streams and divisions
            </p>
          </CardContent>
        </Card>

        {/* Subjects Metric */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curriculum Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isSubjectsLoading ? (
              <LoadingSpinner className="h-5 w-5 text-primary my-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {subjects?.length ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Subjects taught across curriculum
            </p>
          </CardContent>
        </Card>

        {/* Teacher Assignments Metric */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isTeacher ? "My Class Assignments" : "Faculty Assignments"}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isAssignmentsLoading ? (
              <LoadingSpinner className="h-5 w-5 text-primary my-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {assignments?.length ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {isTeacher ? "Your authorized classes & subjects" : "Class-subject pairings"}
            </p>
          </CardContent>
        </Card>

        {/* Enrollments Metric */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isEnrollmentsLoading ? (
              <LoadingSpinner className="h-5 w-5 text-primary my-1" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {enrollments?.length ?? 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Students placed into class rosters
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Quick Workspaces
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/classes"
            className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Building2 className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="mt-4 font-semibold text-sm text-foreground">
              Class Management
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              View registered classes, check capacity, and organize grade streams.
            </p>
          </Link>

          <Link
            href="/subjects"
            className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="mt-4 font-semibold text-sm text-foreground">
              Subjects & Courses
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Inspect curriculum subject codes, departments, and course descriptions.
            </p>
          </Link>

          <Link
            href="/teacher-assignments"
            className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <UserCheck className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h4 className="mt-4 font-semibold text-sm text-foreground">
              Teacher Assignments
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage teacher allocations across subjects, terms, and classes.
            </p>
          </Link>

          {isAdmin && (
            <>
              <Link
                href="/enrollments"
                className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="mt-4 font-semibold text-sm text-foreground">
                  Student Enrollments
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enroll students, monitor rosters, and update enrollment statuses.
                </p>
              </Link>

              <Link
                href="/academics"
                className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="mt-4 font-semibold text-sm text-foreground">
                  Academic Calendar & Terms
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Configure school years, start/end dates, and term milestones.
                </p>
              </Link>

              <Link
                href="/settings"
                className="group rounded-xl border bg-card p-5 shadow-xs hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h4 className="mt-4 font-semibold text-sm text-foreground">
                  School Branding & Settings
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Customize institution colors, contact info, and branding themes.
                </p>
              </Link>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
