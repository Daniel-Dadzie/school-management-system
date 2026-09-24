import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, CalendarCheck } from "lucide-react";
import Link from "next/link";

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/teacher-classes">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookMarked className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/attendance">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Take</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}