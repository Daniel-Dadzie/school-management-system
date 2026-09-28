import type { AttendanceBulkRequest, AttendanceResponse, AttendanceStatus } from '../../api/attendance';
import { AttendanceRepository } from '../repositories/attendance-repository';
import { assertPermission, AuthorizationError, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';
import type { AttendanceRecord } from '../types';

const currentUser = () => useAuthStore.getState().user;

const subjectForRecord = (record: AttendanceRecord): string => {
  if (record.subjectId) return record.subjectId;
  const store = MockDatabase.getStore();
  return store.teacherAssignments.find((assignment) =>
    assignment.teacherId === record.recordedById && assignment.tenantId === record.tenantId &&
    assignment.schoolClassId === record.schoolClassId && assignment.termId === record.termId &&
    assignment.status === 'ACTIVE',
  )?.subjectId ?? '';
};

const toResponse = (record: AttendanceRecord): AttendanceResponse => ({
  id: record.id,
  studentId: record.studentId,
  classId: record.schoolClassId,
  subjectId: subjectForRecord(record),
  termId: record.termId,
  attendanceDate: record.date,
  status: record.status,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

const hasTeacherAssignment = (userId: string, tenantId: string, classId: string, subjectId: string, termId: string, academicYearId: string) =>
  MockDatabase.getStore().teacherAssignments.some((assignment) =>
    assignment.teacherId === userId && assignment.tenantId === tenantId && assignment.status === 'ACTIVE' &&
    assignment.schoolClassId === classId && assignment.subjectId === subjectId &&
    assignment.termId === termId && assignment.academicYearId === academicYearId,
  );

export class AttendanceService {
  static forTerm(termId: string): AttendanceResponse[] {
    assertPermission(permissions.attendanceView);
    const user = currentUser();
    const store = MockDatabase.getStore();
    const records = AttendanceRepository.findByTerm(termId).filter((record) => record.tenantId === user?.tenantId);
    const scopedRecords = user?.role === 'TEACHER'
      ? records.filter((record) => store.teacherAssignments.some((assignment) =>
        assignment.teacherId === user.id && assignment.tenantId === user.tenantId && assignment.status === 'ACTIVE' &&
        assignment.termId === record.termId && assignment.schoolClassId === record.schoolClassId &&
        assignment.subjectId === subjectForRecord(record),
      ))
      : user?.role === 'PARENT'
        ? records.filter((record) => store.students.some((student) =>
          student.id === record.studentId && student.guardianId === user.id && student.tenantId === user.tenantId,
        ))
        : records;

    return scopedRecords.map(toResponse);
  }

  static forClassDate(termId: string, classId: string, subjectId: string, date: string): AttendanceResponse[] {
    return this.forTerm(termId).filter((record) =>
      record.classId === classId && record.subjectId === subjectId && record.attendanceDate === date,
    );
  }

  static submitBulk(request: AttendanceBulkRequest): AttendanceResponse[] {
    assertPermission(permissions.attendanceRecord);
    const user = currentUser();
    if (!user?.tenantId) throw new AuthorizationError();
    const tenantId = user.tenantId;
    const store = MockDatabase.getStore();
    const term = store.terms.find((item) => item.id === request.termId && item.tenantId === user.tenantId);
    const schoolClass = store.classes.find((item) => item.id === request.classId && item.tenantId === user.tenantId);
    const subject = store.subjects.find((item) => item.id === request.subjectId && item.tenantId === user.tenantId);
    const year = store.academicYears.find((item) => item.id === term?.academicYearId && item.tenantId === user.tenantId);
    const assignment = store.teacherAssignments.find((item) =>
      item.teacherId === user.id && item.tenantId === user.tenantId && item.status === 'ACTIVE' &&
      item.schoolClassId === request.classId && item.subjectId === request.subjectId &&
      item.termId === request.termId && item.academicYearId === term?.academicYearId,
    );

    if (!term || !schoolClass || !subject || !year || schoolClass.academicYearId !== term.academicYearId) {
      throw new Error('Choose a class, subject, and term from the same school and academic year.');
    }
    if (user.role === 'TEACHER' && !assignment) throw new AuthorizationError();
    if (year.status !== 'ACTIVE') throw new Error('Attendance can only be recorded during an active academic year.');
    if (request.attendanceDate < term.startDate.slice(0, 10) || request.attendanceDate > term.endDate.slice(0, 10)) {
      throw new Error('Attendance date must be within the selected term.');
    }
    if (request.attendanceDate > new Date().toISOString().slice(0, 10)) {
      throw new Error('Attendance cannot be recorded for a future date.');
    }
    if (request.records.length === 0 || new Set(request.records.map((record) => record.studentId)).size !== request.records.length) {
      throw new Error('Attendance must include a unique status for each student.');
    }

    const records: AttendanceRecord[] = request.records.map((input) => {
      const student = store.students.find((item) => item.id === input.studentId && item.tenantId === tenantId && item.status === 'ACTIVE');
      const enrollment = store.enrollments.find((item) =>
        item.studentId === input.studentId && item.tenantId === tenantId && item.schoolClassId === request.classId &&
        item.academicYearId === term.academicYearId && item.status === 'ACTIVE',
      );
      if (!student || !enrollment || student.currentClassId !== request.classId) {
        throw new Error('Every selected student must have an active enrollment in this class for the selected year.');
      }
      if (!['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].includes(input.status)) {
        throw new Error('Choose a valid attendance status for every student.');
      }
      const existing = store.attendance.some((record) =>
        record.tenantId === tenantId && record.studentId === input.studentId &&
        record.schoolClassId === request.classId && subjectForRecord(record) === request.subjectId &&
        record.termId === request.termId && record.date === request.attendanceDate,
      );
      if (existing) throw new Error('Attendance has already been recorded for one or more students on this date.');

      const timestamp = new Date().toISOString();
      return {
        id: `attendance-${globalThis.crypto.randomUUID()}`,
        tenantId,
        studentId: input.studentId,
        schoolClassId: request.classId,
        subjectId: request.subjectId,
        date: request.attendanceDate,
        status: input.status,
        termId: request.termId,
        academicYearId: term.academicYearId,
        recordedById: user.id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    });

    return AttendanceRepository.saveMany(records).map(toResponse);
  }

  static updateStatus(id: string, status: AttendanceStatus): AttendanceResponse {
    assertPermission(permissions.attendanceRecord);
    const user = currentUser();
    if (!user?.tenantId) throw new AuthorizationError();
    const record = AttendanceRepository.findById(id);
    if (!record || record.tenantId !== user.tenantId) throw new Error('Attendance record not found.');
    const store = MockDatabase.getStore();
    const term = store.terms.find((item) => item.id === record.termId && item.tenantId === user.tenantId);
    const year = store.academicYears.find((item) => item.id === term?.academicYearId && item.tenantId === user.tenantId);
    if (!term || year?.status !== 'ACTIVE') throw new Error('Attendance can only be updated during an active academic year.');
    if (user.role === 'TEACHER' && !hasTeacherAssignment(user.id, user.tenantId, record.schoolClassId, subjectForRecord(record), record.termId, term.academicYearId)) {
      throw new AuthorizationError();
    }
    return toResponse(AttendanceRepository.save({ ...record, status, updatedAt: new Date().toISOString() }));
  }
}
