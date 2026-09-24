import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileSpreadsheet, CalendarCheck } from "lucide-react";
import Link from "next/link";

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/parent-children">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Children</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
              <div className="text-2xl font-bold">View</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/results">
          <Card className="hover:bg-accent transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Results</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">View</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}