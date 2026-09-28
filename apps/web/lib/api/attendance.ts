import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export type AttendanceStatus = AttendanceResponse['status'];

export interface AttendanceBulkRequest {
  termId: string;
  classId: string;
  subjectId: string;
  attendanceDate: string;
  records: { studentId: string; status: AttendanceStatus }[];
}

export const attendanceApi = {
  getAttendanceForTerm: (termId: string): Promise<AttendanceResponse[]> =>
    apiClient<AttendanceResponse[]>(`/attendance?termId=${encodeURIComponent(termId)}`),
  getAttendanceForClassDate: (termId: string, classId: string, subjectId: string, date: string): Promise<AttendanceResponse[]> => {
    const params = new URLSearchParams({ termId, classId, subjectId, date });
    return apiClient<AttendanceResponse[]>(`/attendance?${params.toString()}`);
  },
  submitBulk: (request: AttendanceBulkRequest): Promise<AttendanceResponse[]> =>
    apiClient<AttendanceResponse[]>('/attendance/bulk', { method: 'POST', body: JSON.stringify(request) }),
  updateStatus: (id: string, status: AttendanceStatus): Promise<AttendanceResponse> =>
    apiClient<AttendanceResponse>(`/attendance/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

export function useAttendanceForTerm(termId: string) {
  return useQuery({
    queryKey: ['attendance-history', termId],
    queryFn: () => AttendanceAdapter.getAttendanceForTerm(termId),
    enabled: Boolean(termId),
  });
}

export function useAttendanceForClassDate(termId: string, classId: string, subjectId: string, date: string, enabled: boolean) {
  return useQuery({
    queryKey: ['attendance-daily', termId, classId, subjectId, date],
    queryFn: () => AttendanceAdapter.getAttendanceForClassDate(termId, classId, subjectId, date),
    enabled: enabled && Boolean(termId && classId && subjectId && date),
  });
}

export function useSubmitAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: AttendanceBulkRequest) => AttendanceAdapter.submitBulk(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-daily'] });
    },
  });
}

export function useUpdateAttendanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AttendanceStatus }) => AttendanceAdapter.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-daily'] });
    },
  });
}
