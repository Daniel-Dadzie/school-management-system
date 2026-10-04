import { isMockMode } from '../config';
import { attendanceApi } from '../../api/attendance';
import { AttendanceService } from '../services/attendance-service';
import type { AttendanceBulkRequest, AttendanceResponse, AttendanceStatus } from '../../api/attendance';

export class AttendanceAdapter {
  static getAttendanceForTerm(termId: string) { return isMockMode ? Promise.resolve(AttendanceService.forTerm(termId)) : attendanceApi.getAttendanceForTerm(termId); }
  static getAttendanceForClassDate(termId: string, classId: string, subjectId: string, date: string): Promise<AttendanceResponse[]> {
    return isMockMode ? Promise.resolve(AttendanceService.forClassDate(termId, classId, subjectId, date)) : attendanceApi.getAttendanceForClassDate(termId, classId, subjectId, date);
  }
  static submitBulk(request: AttendanceBulkRequest): Promise<AttendanceResponse[]> {
    return isMockMode ? Promise.resolve(AttendanceService.submitBulk(request)) : attendanceApi.submitBulk(request);
  }
  static updateStatus(id: string, status: AttendanceStatus): Promise<AttendanceResponse> {
    return isMockMode ? Promise.resolve(AttendanceService.updateStatus(id, status)) : attendanceApi.updateStatus(id, status);
  }
}
