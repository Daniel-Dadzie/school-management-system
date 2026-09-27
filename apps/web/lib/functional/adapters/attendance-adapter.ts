import { isMockMode } from '../config';
import { attendanceApi } from '../../api/attendance';
import { AttendanceService } from '../services/attendance-service';

export class AttendanceAdapter {
  static getAttendanceForTerm(termId: string) { return isMockMode ? Promise.resolve(AttendanceService.forTerm(termId)) : attendanceApi.getAttendanceForTerm(termId); }
}
