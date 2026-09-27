import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { AttendanceAdapter } from '../functional/adapters/attendance-adapter';

export interface AttendanceResponse {
  id: string;
  studentId: string;
  classId: string;
  subjectId: string;
  termId: string;
  attendanceDate: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  createdAt: string;
  updatedAt?: string;
}

export const attendanceApi = {
  getAttendanceForTerm: (termId: string): Promise<AttendanceResponse[]> =>
    apiClient<AttendanceResponse[]>(`/attendance?termId=${encodeURIComponent(termId)}`),
};

export function useAttendanceForTerm(termId: string) {
  return useQuery({
    queryKey: ['attendance-history', termId],
    queryFn: () => AttendanceAdapter.getAttendanceForTerm(termId),
    enabled: Boolean(termId),
  });
}
