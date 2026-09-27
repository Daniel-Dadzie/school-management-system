import { isMockMode } from '../config';
import { MockDatabase } from '../storage/database';
import { apiClient } from '../../api/client';

export interface AdminMetrics {
  studentsCount: number;
  teachersCount: number;
  pendingApplicationsCount: number;
  attendanceTodayCount: number;
}

export class DashboardAdapter {
  static async getMetrics(): Promise<AdminMetrics> {
    if (!isMockMode) {
      return apiClient<AdminMetrics>("/dashboard/metrics");
    }

    // Functional Mode: Calculate metrics from the Mock Store
    const store = MockDatabase.getStore();
    
    const studentsCount = store.students.filter(s => s.status === 'ACTIVE').length;
    const teachersCount = store.users.filter(u => u.role === 'TEACHER' && u.isActive).length;
    
    const pendingApplicationsCount = store.admissions.filter(
      a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW'
    ).length;

    const today = new Date().toISOString().split('T')[0];
    const attendanceTodayCount = store.attendance.filter(
      a => a.date.startsWith(today)
    ).length;

    return {
      studentsCount,
      teachersCount,
      pendingApplicationsCount,
      attendanceTodayCount,
    };
  }
}
