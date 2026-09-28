import type { AttendanceResponse } from '../../api/attendance';
import { AttendanceRepository } from '../repositories/attendance-repository';
import { assertPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';

export class AttendanceService {
  static forTerm(termId: string): AttendanceResponse[] {
    assertPermission(permissions.attendanceView);
    const user = useAuthStore.getState().user;
    const store = MockDatabase.getStore();
    const records = AttendanceRepository.findByTerm(termId).filter((record) => record.tenantId === user?.tenantId);
    const scopedRecords = user?.role === 'TEACHER'
      ? records.filter((record) => store.teacherAssignments.some((assignment) =>
        assignment.teacherId === user.id && assignment.tenantId === user.tenantId && assignment.status === 'ACTIVE' &&
        assignment.termId === record.termId && assignment.schoolClassId === record.schoolClassId,
      ))
      : user?.role === 'PARENT'
        ? records.filter((record) => store.students.some((student) =>
          student.id === record.studentId && student.guardianId === user.id && student.tenantId === user.tenantId,
        ))
        : records;

    return scopedRecords.map((record) => ({
      id: record.id, studentId: record.studentId, classId: record.schoolClassId,
      subjectId: store.teacherAssignments.find((assignment) =>
        assignment.teacherId === record.recordedById && assignment.tenantId === record.tenantId &&
        assignment.schoolClassId === record.schoolClassId && assignment.termId === record.termId &&
        assignment.status === 'ACTIVE',
      )?.subjectId ?? '', termId: record.termId, attendanceDate: record.date,
      status: record.status, createdAt: record.createdAt, updatedAt: record.updatedAt,
    }));
  }
}
