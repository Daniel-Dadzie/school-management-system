import type { AttendanceResponse } from '../../api/attendance';
import { AttendanceRepository } from '../repositories/attendance-repository';

export class AttendanceService {
  static forTerm(termId: string): AttendanceResponse[] {
    return AttendanceRepository.findByTerm(termId).map((record) => ({
      id: record.id, studentId: record.studentId, classId: record.schoolClassId,
      subjectId: '', termId: record.termId, attendanceDate: record.date,
      status: record.status, createdAt: record.createdAt, updatedAt: record.updatedAt,
    }));
  }
}
