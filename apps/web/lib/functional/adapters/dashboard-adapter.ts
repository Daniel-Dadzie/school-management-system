import { isMockMode } from '../config';
import { MockDatabase } from '../storage/database';
import { apiClient } from '../../api/client';

export interface AdminMetrics {
  studentsCount: number;
  teachersCount: number;
  pendingApplicationsCount: number;
  attendanceTodayCount: number;
  enrollmentDistribution: { grade: string; count: number }[];
  attendanceSummary: { present: number; absent: number; late: number };
}

export interface TeacherMetrics {
  myClassesCount: number;
  myStudentsCount: number;
  classPerformance: { subject: string; average: number }[];
  attendanceSummary: { present: number; absent: number; late: number };
}

export interface ParentMetrics {
  outstandingBalance: number;
  myWardsCount: number;
  unreadNotifications: number;
  wardsPerformance: { name: string; score: number }[];
  attendanceSummary: { present: number; absent: number; late: number };
}

export class DashboardAdapter {
  static async getMetrics(): Promise<AdminMetrics> {
    if (!isMockMode) {
      return apiClient<AdminMetrics>("/dashboard/metrics");
    }

    const store = MockDatabase.getStore();

    const studentsCount = store.students.filter(s => s.status === 'ACTIVE').length;
    const teachersCount = store.users.filter(u => u.role === 'TEACHER' && u.isActive).length;

    const pendingApplicationsCount = store.admissions.filter(
      a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
    ).length;

    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = store.attendance.filter(a => a.date.startsWith(today));
    const attendanceTodayCount = todaysAttendance.length;

    const distributionMap: Record<string, number> = {};
    store.students.forEach(student => {
      if (student.status !== 'ACTIVE') return;
      const classRecord = store.classes.find(c => c.id === student.currentClassId);
      const gradeName = classRecord ? classRecord.gradeLevel : 'Unassigned';
      distributionMap[gradeName] = (distributionMap[gradeName] || 0) + 1;
    });
    const enrollmentDistribution = Object.entries(distributionMap).map(([grade, count]) => ({ grade, count }));

    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    todaysAttendance.forEach(a => {
      if (a.status === 'PRESENT') attendanceSummary.present++;
      else if (a.status === 'ABSENT') attendanceSummary.absent++;
      else if (a.status === 'LATE') attendanceSummary.late++;
    });

    return {
      studentsCount,
      teachersCount,
      pendingApplicationsCount,
      attendanceTodayCount,
      enrollmentDistribution,
      attendanceSummary
    };
  }

  static async getTeacherMetrics(teacherId: string): Promise<TeacherMetrics> {
    if (!isMockMode) {
      return apiClient<TeacherMetrics>("/dashboard/teacher-metrics");
    }

    const store = MockDatabase.getStore();

    const assignments = store.teacherAssignments.filter(a => a.teacherId === teacherId);
    const myClassesCount = new Set(assignments.map(a => a.schoolClassId)).size;

    const myStudentsCount = store.students.filter(s =>
      s.status === 'ACTIVE' && assignments.some(a => a.schoolClassId === s.currentClassId)
    ).length;

    const classPerformance = assignments.slice(0, 4).map(a => {
      const subject = store.subjects.find(s => s.id === a.subjectId)?.name || 'Unknown';
      return { subject, average: 75 + Math.floor(Math.random() * 20) };
    });

    const today = new Date().toISOString().split('T')[0];
    const attendanceSummary = { present: 0, absent: 0, late: 0 };

    const todaysAttendance = store.attendance.filter(a => a.date.startsWith(today));
    const myStudentIds = new Set(store.students.filter(s =>
      assignments.some(assign => assign.schoolClassId === s.currentClassId)
    ).map(s => s.id));

    todaysAttendance.forEach(a => {
      if (myStudentIds.has(a.studentId)) {
        if (a.status === 'PRESENT') attendanceSummary.present++;
        else if (a.status === 'ABSENT') attendanceSummary.absent++;
        else if (a.status === 'LATE') attendanceSummary.late++;
      }
    });

    return {
      myClassesCount,
      myStudentsCount,
      classPerformance,
      attendanceSummary
    };
  }

  static async getParentMetrics(parentId: string): Promise<ParentMetrics> {
    if (!isMockMode) {
      return apiClient<ParentMetrics>("/dashboard/parent-metrics");
    }

    const store = MockDatabase.getStore();

    const wards = store.students.slice(0, 2);
    const myWardsCount = wards.length;

    const unreadNotifications = 2;

    const wardsPerformance = wards.map(w => ({
      name: w.firstName,
      score: 80 + Math.floor(Math.random() * 15)
    }));

    const today = new Date().toISOString().split('T')[0];
    const attendanceSummary = { present: 0, absent: 0, late: 0 };
    const myStudentIds = new Set(wards.map(w => w.id));

    const outstandingBalance = store.invoices
      .filter(inv => myStudentIds.has(inv.studentId) && inv.status !== "PAID" && inv.status !== "VOID")
      .reduce((sum, inv) => sum + (inv.amount - inv.amountPaid), 0);

    store.attendance.forEach(a => {
      if (a.date.startsWith(today) && myStudentIds.has(a.studentId)) {
        if (a.status === 'PRESENT') attendanceSummary.present++;
        else if (a.status === 'ABSENT') attendanceSummary.absent++;
        else if (a.status === 'LATE') attendanceSummary.late++;
      }
    });

    if (attendanceSummary.present === 0 && attendanceSummary.absent === 0) {
      attendanceSummary.present = wards.length;
    }

    return {
      myWardsCount,
      unreadNotifications,
      wardsPerformance,
      attendanceSummary
    };
  }
}
