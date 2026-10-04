"use client";

import { useQuery } from "@tanstack/react-query";
import { MockDatabase } from "@/lib/functional/storage/database";

import {
  Bell, FileSpreadsheet, AlertTriangle, CalendarCheck,
  CreditCard, Megaphone, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import type {
  AssessmentResultRecord,
  AttendanceRecord,
  FamilyWalletTransactionRecord,
  IncidentRecord,
  NotificationRecord,
  StudentRecord,
} from "@/lib/functional/types";
import type { LucideIcon } from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'GRADE' | 'BEHAVIOR' | 'ATTENDANCE' | 'WALLET' | 'ANNOUNCEMENT' | 'NOTIFICATION';
  title: string;
  description: string;
  studentId?: string;
  studentName?: string;
  icon: LucideIcon;
  colorClass: string;
}

export function ParentTimelineFeed({ parentId }: { parentId: string }) {
  const { data: events, isLoading } = useQuery({
    queryKey: ["parent-timeline", parentId],
    queryFn: async () => {
      // 1. Fetch Students linked to parent
      const students = MockDatabase.getCollection("students").filter((s: StudentRecord) => s.guardianId === parentId);
      const studentIds = students.map(s => s.id);
      const studentMap = students.reduce((acc, s) => ({ ...acc, [s.id]: `${s.firstName} ${s.lastName}` }), {} as Record<string, string>);

      const timeline: TimelineEvent[] = [];

      // 2. Attendance
      const attendance = MockDatabase.getCollection("attendance").filter((a: AttendanceRecord) => studentIds.includes(a.studentId));
      attendance.forEach(a => {
        if (a.status !== 'PRESENT') {
          timeline.push({
            id: `att-${a.id}`,
            timestamp: a.date + "T08:00:00Z", // Approximate time
            type: 'ATTENDANCE',
            title: `Attendance: ${a.status.charAt(0) + a.status.slice(1).toLowerCase()}`,
            description: a.notes || `Student was marked ${a.status.toLowerCase()}.`,
            studentId: a.studentId,
            studentName: studentMap[a.studentId],
            icon: CalendarCheck,
            colorClass: a.status === 'ABSENT' ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-orange-500 bg-orange-500/10 border-orange-500/20'
          });
        }
      });

      // 3. Discipline / Behavior
      const incidents = MockDatabase.getCollection("incidents").filter((i: IncidentRecord) => studentIds.includes(i.studentId));
      incidents.forEach(i => {
        timeline.push({
          id: `inc-${i.id}`,
          timestamp: i.createdAt,
          type: 'BEHAVIOR',
          title: `Behavior Alert: ${i.category.replace('_', ' ')}`,
          description: i.title,
          studentId: i.studentId,
          studentName: studentMap[i.studentId],
          icon: AlertTriangle,
          colorClass: i.category === 'BEHAVIOUR' ? 'text-green-600 bg-green-600/10 border-green-600/20' : 'text-destructive bg-destructive/10 border-destructive/20'
        });
      });

      // 4. Grades / Assessment Results
      const results = MockDatabase.getCollection("assessmentResults").filter((r: AssessmentResultRecord) => studentIds.includes(r.studentId));
      const assessments = MockDatabase.getCollection("assessments");
      results.forEach(r => {
        const assessment = assessments.find(a => a.id === r.assessmentId);
        timeline.push({
          id: `res-${r.id}`,
          timestamp: r.updatedAt || r.createdAt || new Date().toISOString(),
          type: 'GRADE',
          title: `Grade Posted: ${assessment?.title || 'Assessment'}`,
          description: `Scored ${r.score}/${assessment?.maximumScore ?? 100} (${((r.score / (assessment?.maximumScore ?? 100)) * 100).toFixed(1)}%)`,
          studentId: r.studentId,
          studentName: studentMap[r.studentId],
          icon: FileSpreadsheet,
          colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
        });
      });

      // 5. Wallet Transactions
      const transactions = MockDatabase.getCollection("familyWalletTransactions").filter((t: FamilyWalletTransactionRecord) => t.parentId === parentId);
      transactions.forEach(t => {
        timeline.push({
          id: `wal-${t.id}`,
          timestamp: t.createdAt,
          type: 'WALLET',
          title: t.type === 'DEPOSIT' ? 'Wallet Top-up' : 'Wallet Purchase',
          description: `${t.description} - â‚¦${(t.amountMinor / 100).toFixed(2)}`,
          icon: CreditCard,
          colorClass: t.type === 'DEPOSIT' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-purple-500 bg-purple-500/10 border-purple-500/20'
        });
      });

      // 6. Notifications
      const notifications = MockDatabase.getCollection("notifications").filter((n: NotificationRecord) => n.userId === parentId);
      notifications.forEach(n => {
        timeline.push({
          id: `not-${n.id}`,
          timestamp: n.createdAt,
          type: 'NOTIFICATION',
          title: n.title,
          description: n.message,
          icon: Bell,
          colorClass: 'text-foreground bg-accent border-accent'
        });
      });

      // Sort chronological descending (newest first)
      return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    enabled: !!parentId
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Timeline Feed</CardTitle>
          <CardDescription>Loading your updates...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="h-full border-dashed shadow-none">
        <CardHeader>
          <CardTitle>Timeline Feed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 py-12">
          <Bell className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground text-sm text-center">No recent activities on your timeline.</p>
        </CardContent>
      </Card>
    );
  }

  const latestEvents = events.slice(0, 15);

  return (
    <Card className="h-full border-primary/20 shadow-sm bg-gradient-to-b from-card to-card/50">
      <CardHeader className="pb-4 border-b bg-card rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Live Timeline
        </CardTitle>
          <CardDescription>A chronological feed of your children&apos;s day</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative">
        <div className="absolute left-9 top-6 bottom-0 w-px bg-border/50"></div>
        <div className="space-y-6">
          {latestEvents.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex gap-4 items-start group">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border bg-background shadow-sm mt-1 shrink-0 ${event.colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 bg-card rounded-xl border shadow-sm p-4 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                      {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: true }).format(new Date(event.timestamp))}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

                  {event.studentName && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5 rounded-md px-2 font-normal">
                        Student: {event.studentName}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-5 rounded-md px-2 font-normal border-dashed">
                        {event.type}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
