import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Calendar, GraduationCap, Users } from "lucide-react";

export default function AcademicSetupOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Academic Setup</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/academic-setup/years">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <Calendar className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Academic Years</CardTitle>
              <CardDescription>Manage academic years and their statuses.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/academic-setup/terms">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <Calendar className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Terms</CardTitle>
              <CardDescription>Configure terms within academic years.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/academic-setup/classes">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <Users className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Classes</CardTitle>
              <CardDescription>Manage class levels and capacities.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/academic-setup/subjects">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <BookOpen className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Configure curriculum subjects.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/academic-setup/teacher-assignments">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader>
              <GraduationCap className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Teacher Assignments</CardTitle>
              <CardDescription>Assign teachers to classes and subjects.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}