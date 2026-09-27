import type {
  AcademicYearRequest, AcademicYearResponse, EnrollmentRequest, EnrollmentResponse,
  EnrollmentStatus, SchoolClassRequest, SchoolClassResponse, SubjectRequest,
  SubjectResponse, TeacherAssignmentRequest, TeacherAssignmentResponse, TermRequest,
  TermResponse, AssignmentStatus,
} from '../../api/academic';
import { AcademicRepository } from '../repositories/academic-repository';
import { MockDatabase } from '../storage/database';
import { AcademicYearRecord, ClassRecord, EnrollmentRecord, SubjectRecord, TeacherAssignmentRecord, TermRecord } from '../types';

const id = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
const now = () => new Date().toISOString();
const yearDto = (v: AcademicYearRecord): AcademicYearResponse => ({ ...v });
const termDto = (v: TermRecord): TermResponse => ({ ...v });
const classDto = (v: ClassRecord): SchoolClassResponse => ({ id: v.id, name: v.name, level: v.gradeLevel, capacity: v.capacity, createdAt: v.createdAt ?? '' , updatedAt: v.updatedAt });
const subjectDto = (v: SubjectRecord): SubjectResponse => ({ ...v });
const assignmentDto = (v: TeacherAssignmentRecord): TeacherAssignmentResponse => ({ ...v });
const enrollmentDto = (v: EnrollmentRecord): EnrollmentResponse => ({ ...v });

export class AcademicService {
  static years(): AcademicYearResponse[] { return AcademicRepository.years().map(yearDto); }
  static createYear(data: AcademicYearRequest): AcademicYearResponse {
    const timestamp = now();
    const record: AcademicYearRecord = { ...data, id: id('year'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'UPCOMING', createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('academicYears', [...AcademicRepository.years(), record]); return yearDto(record);
  }
  static terms(yearId: string): TermResponse[] { return AcademicRepository.terms(yearId).map(termDto); }
  static createTerm(yearId: string, data: TermRequest): TermResponse {
    const timestamp = now();
    const record: TermRecord = { ...data, id: id('term'), tenantId: MockDatabase.getStore().tenants[0].id, academicYearId: yearId, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('terms', [...MockDatabase.getStore().terms, record]); return termDto(record);
  }
  static classes(): SchoolClassResponse[] { return AcademicRepository.classes().map(classDto); }
  static createClass(data: SchoolClassRequest): SchoolClassResponse {
    const timestamp = now();
    const record: ClassRecord = { id: id('class'), tenantId: MockDatabase.getStore().tenants[0].id, name: data.name, gradeLevel: data.level, academicYearId: AcademicRepository.years()[0]?.id ?? '', capacity: data.capacity ?? 30, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('classes', [...AcademicRepository.classes(), record]); return classDto(record);
  }
  static subjects(): SubjectResponse[] { return AcademicRepository.subjects().map(subjectDto); }
  static createSubject(data: SubjectRequest): SubjectResponse {
    const timestamp = now();
    const record: SubjectRecord = { ...data, id: id('subject'), tenantId: MockDatabase.getStore().tenants[0].id, createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('subjects', [...AcademicRepository.subjects(), record]); return subjectDto(record);
  }
  static assignments(): TeacherAssignmentResponse[] { return AcademicRepository.assignments().map(assignmentDto); }
  static createAssignment(data: TeacherAssignmentRequest): TeacherAssignmentResponse {
    const timestamp = now();
    const record: TeacherAssignmentRecord = { ...data, id: id('assignment'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'ACTIVE', createdAt: timestamp, updatedAt: timestamp };
    AcademicRepository.save('teacherAssignments', [...AcademicRepository.assignments(), record]); return assignmentDto(record);
  }
  static setAssignmentStatus(recordId: string, status: AssignmentStatus): TeacherAssignmentResponse {
    const record = AcademicRepository.assignments().find((item) => item.id === recordId);
    if (!record) throw new Error('Teacher assignment not found');
    const updated = { ...record, status, updatedAt: now() };
    AcademicRepository.save('teacherAssignments', AcademicRepository.assignments().map((item) => item.id === recordId ? updated : item)); return assignmentDto(updated);
  }
  static enrollments(): EnrollmentResponse[] { return AcademicRepository.enrollments().map(enrollmentDto); }
  static createEnrollment(data: EnrollmentRequest): EnrollmentResponse {
    const timestamp = now();
    const record: EnrollmentRecord = { ...data, id: id('enrollment'), tenantId: MockDatabase.getStore().tenants[0].id, status: 'ACTIVE', enrolledAt: timestamp, createdAt: timestamp };
    AcademicRepository.save('enrollments', [...AcademicRepository.enrollments(), record]); return enrollmentDto(record);
  }
  static setEnrollmentStatus(recordId: string, status: EnrollmentStatus): EnrollmentResponse {
    const record = AcademicRepository.enrollments().find((item) => item.id === recordId);
    if (!record) throw new Error('Enrollment not found');
    const updated: EnrollmentRecord = { ...record, status, updatedAt: now() };
    AcademicRepository.save('enrollments', AcademicRepository.enrollments().map((item) => item.id === recordId ? updated : item)); return enrollmentDto(updated);
  }
}
