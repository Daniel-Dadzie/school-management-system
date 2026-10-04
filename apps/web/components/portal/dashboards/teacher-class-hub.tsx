"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useStudents } from "@/hooks/use-students";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AcademicAdapter } from "@/lib/functional/adapters/academic-adapter";
import { MockDatabase } from "@/lib/functional/storage/database";
import type { AttendanceRecord, IncidentRecord } from "@/lib/functional/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";
import { Check, X, AlertTriangle, Star, MoreVertical } from "lucide-react";


export function TeacherClassHub() {
  const user = useAuthStore(state => state.user);
  const queryClient = useQueryClient();
  const activeDate = new Date().toISOString().split('T')[0];

  // 1. Get Teacher's Class
  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicAdapter.getSchoolClasses(),
  });

  const { data: assignments } = useQuery({
    queryKey: ["teacher-assignments", "me", user?.id],
    queryFn: () => AcademicAdapter.getMyTeacherAssignments(user?.id),
    enabled: Boolean(user?.id),
  });

  const activeAssignment = assignments?.[0];
  const activeClass = classes?.find((schoolClass) => schoolClass.id === activeAssignment?.schoolClassId);

  // 2. Get Students in that class
  const { data: allStudents, isLoading: loadingStudents } = useStudents();
  const classStudents = allStudents?.filter(s => s.currentClassId === activeClass?.id) || [];

  // 3. Get Today's Attendance
  const { data: todayAttendance } = useQuery({
    queryKey: ["attendance-today", activeClass?.id, activeDate],
    queryFn: async () => {
      const all = MockDatabase.getCollection("attendance");
      return all.filter((record: AttendanceRecord) => record.date === activeDate && record.schoolClassId === activeClass?.id);
    },
    enabled: !!activeClass
  });

  // Mutations
  const toggleAttendance = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string, status: 'PRESENT' | 'ABSENT' }) => {
      const records = MockDatabase.getCollection("attendance");
      const existing = records.find((record: AttendanceRecord) => record.studentId === studentId && record.date === activeDate);
      const updatedAt = new Date().toISOString();
      const student = classStudents.find((record) => record.id === studentId);
      if (!student) throw new Error("The student is not assigned to this class.");

      if (existing) {
        MockDatabase.setCollection("attendance", records.map((record: AttendanceRecord) =>
          record.id === existing.id ? { ...record, status, updatedAt } : record
        ));
      } else {
        if (!user || !activeClass || !activeAssignment) throw new Error("A teacher assignment is required to record attendance.");
        const newRecord: AttendanceRecord = {
          id: `attendance-${globalThis.crypto.randomUUID()}`,
          tenantId: student.tenantId,
          studentId,
          schoolClassId: activeClass.id,
          date: activeDate,
          status,
          termId: activeAssignment.termId,
          academicYearId: activeAssignment.academicYearId,
          recordedById: user.id,
          createdAt: updatedAt,
          updatedAt,
        };
        MockDatabase.setCollection("attendance", [...records, newRecord]);
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      toast.success("Attendance updated");
    }
  });

  const logBehavior = useMutation({
    mutationFn: async ({ studentId, type }: { studentId: string, type: 'MERIT' | 'DEMERIT' }) => {
      const student = classStudents.find((record) => record.id === studentId);
      if (!user || !activeClass || !student) throw new Error("A teacher, class, and assigned student are required to record an incident.");
      const createdAt = new Date().toISOString();
      const incident: IncidentRecord = {
        id: `incident-${globalThis.crypto.randomUUID()}`,
        tenantId: student.tenantId,
        studentId,
        classId: activeClass.id,
        category: type === 'MERIT' ? 'OTHER' : 'BEHAVIOUR',
        severity: type === 'MERIT' ? 'LOW' : 'MEDIUM',
        title: type === 'MERIT' ? 'Positive Contribution' : 'Disruptive Behavior',
        description: type === 'MERIT' ? 'Student showed excellent participation today.' : 'Student was disruptive during the lesson.',
        status: type === 'MERIT' ? 'CLOSED' : 'OPEN',
        reportedBy: user.id,
        createdAt,
        updatedAt: createdAt,
      };
      MockDatabase.setCollection("incidents", [...MockDatabase.getCollection("incidents"), incident]);
      return true;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.type === 'MERIT' ? "Merit point awarded! ðŸŒŸ" : "Incident logged.");
    }
  });

  if (loadingStudents) {
    return <Card className="h-64 flex items-center justify-center"><LoadingSpinner /></Card>;
  }

  if (!activeClass) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No active class assigned.
        </CardContent>
      </Card>
    );
  }

  const getAttendanceStatus = (studentId: string) => {
    return todayAttendance?.find(a => a.studentId === studentId)?.status || 'NONE';
  };

  const presentCount = todayAttendance?.filter(a => a.status === 'PRESENT').length || 0;
  const absentCount = todayAttendance?.filter(a => a.status === 'ABSENT').length || 0;

  return (
    <Card className="border-primary/20 shadow-sm bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b bg-card rounded-t-xl pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              My Classroom: {activeClass.name}
            </CardTitle>
            <CardDescription>
              {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date())} â€¢ {classStudents.length} Students
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
              {presentCount} Present
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
              {absentCount} Absent
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {classStudents.map(student => {
            const status = getAttendanceStatus(student.id);
            const isPresent = status === 'PRESENT';
            const isAbsent = status === 'ABSENT';

            return (
              <div
                key={student.id}
                className={`relative group rounded-xl border p-3 flex flex-col items-center text-center transition-all duration-200 hover:shadow-md
                  ${isPresent ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : ''}
                  ${isAbsent ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : ''}
                  ${status === 'NONE' ? 'bg-card' : ''}
                `}
              >
                {/* Status Indicator Halo */}
                <div className={`absolute inset-0 rounded-xl border-2 pointer-events-none transition-opacity
                  ${isPresent ? 'border-green-400 opacity-100' : 'opacity-0'}
                  ${isAbsent ? 'border-red-400 opacity-100' : 'opacity-0'}
                `} />

                <div aria-hidden="true" className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border bg-background text-lg font-semibold shadow-sm">
                  {student.firstName[0]}{student.lastName[0]}
                </div>

                <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-1 w-full" title={`${student.firstName} ${student.lastName}`}>
                  {student.firstName} {student.lastName}
                </h4>
                <p className="text-[10px] text-muted-foreground mb-4">{student.studentId ?? student.id}</p>

                {/* Quick Actions (Hover) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <details className="relative">
                    <summary aria-label={`Actions for ${student.firstName} ${student.lastName}`} className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-full bg-background/80 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                      <MoreVertical aria-hidden="true" className="h-3 w-3" />
                    </summary>
                    <div className="absolute right-0 z-20 mt-1 flex w-40 flex-col gap-1 rounded-md border bg-popover p-2 shadow-md">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => logBehavior.mutate({ studentId: student.id, type: 'MERIT' })}
                        >
                          <Star className="mr-2 h-4 w-4" /> Award Merit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => logBehavior.mutate({ studentId: student.id, type: 'DEMERIT' })}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" /> Log Incident
                        </Button>
                      </div>
                    </div>
                  </details>
                </div>

                {/* 1-Click Attendance */}
                <div className="flex items-center gap-1 w-full mt-auto z-10">
                  <Button
                    variant={isPresent ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 h-8 px-0 ${isPresent ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 hover:text-green-600'}`}
                    onClick={() => toggleAttendance.mutate({ studentId: student.id, status: 'PRESENT' })}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={isAbsent ? "default" : "outline"}
                    size="sm"
                    className={`flex-1 h-8 px-0 ${isAbsent ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-600'}`}
                    onClick={() => toggleAttendance.mutate({ studentId: student.id, status: 'ABSENT' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
