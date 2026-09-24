const fs = require('fs');

let teacher = 
"use client";

import { useQuery } from "@tanstack/react-query";
import { BookMarked, CalendarCheck, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export function TeacherDashboard() {
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["teacher-today-classes"],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/teacher/dashboard/today-classes");
      } catch (e) {
        return [];
      }
    }
  });

  const { data: gradebookItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["teacher-gradebook-items"],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/teacher/dashboard/gradebook-items");
      } catch (e) {
        return [];
      }
    }
  });

  return (
    <div className="space-y-6">
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Today's Classes</CardTitle>
          <CardDescription>Your schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          {classesLoading ? (
            <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
          ) : classes && classes.length > 0 ? (
            <div className="space-y-4">
              {classes.map((cls, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{cls.period || "Period 1"} - {cls.time || "08:00 AM"}</span>
                    <span className="text-sm">{cls.className || "Class Name"} - {cls.subject || "Subject"}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={\/attendance/take?classId=\\}>
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Take attendance
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No classes today" description="You have no classes scheduled for today." icon={<BookMarked className="h-10 w-10 text-muted-foreground" />} />
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Gradebook Items to Complete</CardTitle>
          <CardDescription>Pending assessments requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
          ) : gradebookItems && gradebookItems.length > 0 ? (
            <div className="space-y-4">
              {gradebookItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{item.assessmentName || "Assessment"}</span>
                    <span className="text-sm text-muted-foreground">{item.className || "Class Name"} - Due: {item.dueDate || "N/A"}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={\/gradebook/\\}>
                      Grade
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="All caught up!" description="There are no pending gradebook items." icon={<FileSpreadsheet className="h-10 w-10 text-muted-foreground" />} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
;

fs.writeFileSync('apps/web/components/portal/dashboards/teacher-dashboard.tsx', teacher, 'utf8');

let parent = 
"use client";

import { useQuery } from "@tanstack/react-query";
import { User, CalendarCheck, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { apiClient } from "@/lib/api/client";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";

export function ParentDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: children, isLoading: childrenLoading } = useQuery({
    queryKey: ["parent-children", user?.id],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/parent/dashboard/children");
      } catch (e) {
        return [];
      }
    },
    enabled: !!user?.id
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["parent-recent-activity", user?.id],
    queryFn: async () => {
      try {
        return await apiClient<any[]>("/parent/dashboard/recent-activity");
      } catch (e) {
        return [];
      }
    },
    enabled: !!user?.id
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {childrenLoading ? (
          <Card className="shadow-xs md:col-span-2 lg:col-span-3">
             <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
          </Card>
        ) : children && children.length > 0 ? (
          children.map((child, i) => (
            <Card key={i} className="shadow-xs">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">{child.name || "Student Name"}</CardTitle>
                  <CardDescription>{child.className || "Class"}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={\/parent-children/\\}>View Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="shadow-xs">
              <CardContent className="p-6">
                 <EmptyState title="No children found" description="You are not linked to any active students." icon={<User className="h-10 w-10 text-muted-foreground" />} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
               <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : recentActivity && recentActivity.filter(a => a.type === 'ATTENDANCE').length > 0 ? (
               <div className="space-y-4">
                 {recentActivity.filter(a => a.type === 'ATTENDANCE').map((item, i) => (
                   <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{item.studentName || "Student"}</p>
                        <p className="text-xs text-muted-foreground">{item.date || "Date"}</p>
                      </div>
                      <span className="text-sm font-semibold">{item.status || "Present"}</span>
                   </div>
                 ))}
               </div>
            ) : (
               <EmptyState title="No recent attendance" description="No attendance records found recently." icon={<CalendarCheck className="h-10 w-10 text-muted-foreground" />} />
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
               <div className="flex h-32 items-center justify-center"><LoadingSpinner className="h-6 w-6" /></div>
            ) : recentActivity && recentActivity.filter(a => a.type === 'RESULT').length > 0 ? (
               <div className="space-y-4">
                 {recentActivity.filter(a => a.type === 'RESULT').map((item, i) => (
                   <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium">{item.studentName || "Student"}</p>
                        <p className="text-xs text-muted-foreground">{item.subject || "Subject"}</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                         <Link href={\/results/\\}><ArrowRight className="h-4 w-4" /></Link>
                      </Button>
                   </div>
                 ))}
               </div>
            ) : (
               <EmptyState title="No recent results" description="No results published recently." icon={<FileSpreadsheet className="h-10 w-10 text-muted-foreground" />} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
;

fs.writeFileSync('apps/web/components/portal/dashboards/parent-dashboard.tsx', parent, 'utf8');

let admin = fs.readFileSync('apps/web/components/portal/dashboards/admin-dashboard.tsx', 'utf8');
admin = admin.replace(/icon=\{ClipboardList\}/g, "icon={<ClipboardList className=\\"h-10 w-10 text-muted-foreground\\" />}");
admin = admin.replace(/icon=\{BookOpen\}/g, "icon={<BookOpen className=\\"h-10 w-10 text-muted-foreground\\" />}");
fs.writeFileSync('apps/web/components/portal/dashboards/admin-dashboard.tsx', admin, 'utf8');

console.log("Done.");
