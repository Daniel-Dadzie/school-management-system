import type {
  AcademicYearRequest, AcademicYearResponse, EnrollmentRequest, EnrollmentResponse,
  EnrollmentStatus, SchoolClassRequest, SchoolClassResponse, SubjectRequest,
  SubjectResponse, TeacherAssignmentRequest, TeacherAssignmentResponse, AcademicTeacherOption, TermRequest,
  TermResponse, AssignmentStatus,
} from '../../api/academic';
import { AcademicRepository } from '../repositories/academic-repository';
import { MockDatabase } from '../storage/database';
import { AcademicYearRecord, ClassRecord, EnrollmentRecord, SubjectRecord, TeacherAssignmentRecord, TermRecord } from '../types';
import { assertPermission, permissions, AuthorizationError } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';

const id = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
const now = () => new Date().toISOString();
const yearDto = (v: AcademicYearRecord): AcademicYearResponse => ({ ...v });
const termDto = (v: TermRecord): TermResponse => ({ ...v });
const classDto = (v: ClassRecord): SchoolClassResponse => ({ id: v.id, name: v.name, level: v.gradeLevel, capacity: v.capacity, createdAt: v.createdAt ?? '' , updatedAt: v.updatedAt });
const subjectDto = (v: SubjectRecord): SubjectResponse => ({ ...v });
const assignmentDto = (v: TeacherAssignmentRecord): TeacherAssignmentResponse => ({ ...v });
const enrollmentDto = (v: EnrollmentRecord): EnrollmentResponse => ({ ...v });
const currentUser = () => useAuthStore.getState().user;
const teacherAssignments = (userId: string) => AcademicRepository.assignments().filter(
  (item) => item.teacherId === userId && item.status === 'ACTIVE' && item.tenantId === currentUser()?.tenantId,
);
const linkedStudentIds = (userId: string) => new Set(
  MockDatabase.getStore().students.filter((student) => student.guardianId === userId && student.tenantId === currentUser()?.tenantId).map((student) => student.id),
);

export class AcademicService {
  static years(): AcademicYearResponse[] {
    assertPermission(permissions.academicsView);
    const user = currentUser();
    if (user?.role === 'TEACHER') {
      const yearIds = new Set(teacherAssignments(user.id).map((item) => item.academicYearId));
      return AcademicRepository.years().filter((item) => yearIds.has(item.id)).map(yearDto);
    }
    if (user?.role === 'PARENT') {
      const studentIds = linkedStudentIds(user.id);
      const yearIds = new Set(AcademicRepository.enrollments().filter((item) => studentIds.has(item.studentId)).map((item) => item.academicYearId));
      return AcademicRepository.years().filter((item) => yearIds.has(item.id)).map(yearDto);
    }
    return AcademicRepository.years().map(yearDto);
  }
  static createYear(data: AcademicYearRequest): AcademicYearResponse {
    assertPermission(permissions.academicsManage);
    const timestamp = now();
    const record: AcademicYearRecord = { ...data, id: id('year'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'UPCOMING', createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('academicYears', [...AcademicRepository.years(), record]); return yearDto(record);
  }
  static terms(yearId: string): TermResponse[] {
    assertPermission(permissions.academicsView);
    const user = currentUser();
    if (user?.role === 'TEACHER' && !teacherAssignments(user.id).some((item) => item.academicYearId === yearId)) return [];
    if (user?.role === 'PARENT') {
      const studentIds = linkedStudentIds(user.id);
      const hasEnrollment = AcademicRepository.enrollments().some((item) => studentIds.has(item.studentId) && item.academicYearId === yearId);
      if (!hasEnrollment) return [];
    }
    return AcademicRepository.terms(yearId).map(termDto);
  }
  static createTerm(yearId: string, data: TermRequest): TermResponse {
    assertPermission(permissions.academicsManage);
    const timestamp = now();
    const record: TermRecord = { ...data, id: id('term'), tenantId: MockDatabase.getStore().tenants[0].id, academicYearId: yearId, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('terms', [...MockDatabase.getStore().terms, record]); return termDto(record);
  }
  static classes(): SchoolClassResponse[] {
    assertPermission(permissions.academicsView);
    const user = currentUser();
    if (user?.role === 'TEACHER') {
      const classIds = new Set(teacherAssignments(user.id).map((item) => item.schoolClassId));
      return AcademicRepository.classes().filter((item) => classIds.has(item.id)).map(classDto);
    }
    if (user?.role === 'PARENT') {
      const studentIds = linkedStudentIds(user.id);
      const classIds = new Set(AcademicRepository.enrollments().filter((item) => studentIds.has(item.studentId)).map((item) => item.schoolClassId));
      return AcademicRepository.classes().filter((item) => classIds.has(item.id)).map(classDto);
    }
    return AcademicRepository.classes().map(classDto);
  }
  static createClass(data: SchoolClassRequest): SchoolClassResponse {
    assertPermission(permissions.academicsManage);
    const timestamp = now();
    const record: ClassRecord = { id: id('class'), tenantId: MockDatabase.getStore().tenants[0].id, name: data.name, gradeLevel: data.level, academicYearId: AcademicRepository.years()[0]?.id ?? '', capacity: data.capacity ?? 30, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('classes', [...AcademicRepository.classes(), record]); return classDto(record);
  }
  static subjects(): SubjectResponse[] {
    assertPermission(permissions.academicsView);
    const user = currentUser();
    if (user?.role === 'TEACHER') {
      const subjectIds = new Set(teacherAssignments(user.id).map((item) => item.subjectId));
      return AcademicRepository.subjects().filter((item) => subjectIds.has(item.id)).map(subjectDto);
    }
    return AcademicRepository.subjects().map(subjectDto);
  }
  static createSubject(data: SubjectRequest): SubjectResponse {
    assertPermission(permissions.academicsManage);
    const timestamp = now();
    const record: SubjectRecord = { ...data, id: id('subject'), tenantId: MockDatabase.getStore().tenants[0].id, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('subjects', [...AcademicRepository.subjects(), record]); return subjectDto(record);
  }
  static assignments(): TeacherAssignmentResponse[] {
    assertPermission(permissions.academicsManage);
    return AcademicRepository.assignments().map(assignmentDto);
  }
  static teacherOptions(): AcademicTeacherOption[] {
    assertPermission(permissions.academicsManage);
    const user = currentUser();
    return MockDatabase.getStore().users
      .filter((item) => item.tenantId === user?.tenantId && item.role === 'TEACHER' && item.isActive)
      .map((item) => ({ id: item.id, displayName: `${item.firstName} ${item.lastName}`.trim() || item.username }));
  }
  static myAssignments(teacherId?: string): TeacherAssignmentResponse[] {
    const user = currentUser();
    assertPermission(permissions.teacherClassesView);
    if (!user || (teacherId && teacherId !== user.id)) throw new AuthorizationError();
    return teacherAssignments(user.id).map(assignmentDto);
  }
  static createAssignment(data: TeacherAssignmentRequest): TeacherAssignmentResponse {
    assertPermission(permissions.academicsManage);
    const timestamp = now();
    const record: TeacherAssignmentRecord = { ...data, id: id('assignment'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'ACTIVE', createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('teacherAssignments', [...AcademicRepository.assignments(), record]); return assignmentDto(record);
  }
  static setAssignmentStatus(recordId: string, status: AssignmentStatus): TeacherAssignmentResponse {
    assertPermission(permissions.academicsManage);
    const record = AcademicRepository.assignments().find((item) => item.id === recordId);
    if (!record) throw new Error('Teacher assignment not found');
    const updated = { ...record, status, updatedAt: now() };
    AcademicRepository.save('teacherAssignments', AcademicRepository.assignments().map((item) => item.id === recordId ? updated : item)); return assignmentDto(updated);
  }
  static enrollments(): EnrollmentResponse[] {
    assertPermission(permissions.enrollmentsView);
    const user = currentUser();
    const records = AcademicRepository.enrollments();
    if (user?.role === 'TEACHER') {
      const assignments = teacherAssignments(user.id);
      return records.filter((item) => assignments.some((assignment) => assignment.schoolClassId === item.schoolClassId && assignment.academicYearId === item.academicYearId)).map(enrollmentDto);
    }
    if (user?.role === 'PARENT') {
      const studentIds = linkedStudentIds(user.id);
      return records.filter((item) => studentIds.has(item.studentId)).map(enrollmentDto);
    }
    return records.map(enrollmentDto);
  }
  static createEnrollment(data: EnrollmentRequest): EnrollmentResponse {
    assertPermission(permissions.enrollmentsManage);
    const timestamp = now();
    const record: EnrollmentRecord = { ...data, id: id('enrollment'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'ACTIVE', enrolledAt: timestamp, createdAt: timestamp };
    AcademicRepository.save('enrollments', [...AcademicRepository.enrollments(), record]); return enrollmentDto(record);
  }
  static setEnrollmentStatus(recordId: string, status: EnrollmentStatus): EnrollmentResponse {
    assertPermission(permissions.enrollmentsManage);
    const record = AcademicRepository.enrollments().find((item) => item.id === recordId);
    if (!record) throw new Error('Enrollment not found');
    const updated: EnrollmentRecord = { ...record, status, updatedAt: now() };
    AcademicRepository.save('enrollments', AcademicRepository.enrollments().map((item) => item.id === recordId ? updated : item)); return enrollmentDto(updated);
  }
}
