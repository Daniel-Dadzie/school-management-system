import { StudentRepository } from '../repositories/student-repository';
import { StudentRecord } from '../types';
import { assertPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';
import { AuditRepository } from '../repositories/audit-repository';
import type { EnrollmentRecord } from '../types';

export interface StudentInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  guardianId: string;
  currentClassId: string;
}

export class StudentService {
  static async getAllStudents(): Promise<StudentRecord[]> {
    assertPermission(permissions.studentsView);
    const user = useAuthStore.getState().user;
    const store = MockDatabase.getStore();
    const students = StudentRepository.findAll().filter((student) => student.tenantId === user?.tenantId);

    if (user?.role === 'PARENT') {
      return students.filter((student) => student.guardianId === user.id);
    }

    if (user?.role === 'TEACHER') {
      const assignments = store.teacherAssignments.filter((assignment) =>
        assignment.teacherId === user.id && assignment.tenantId === user.tenantId && assignment.status === 'ACTIVE',
      );
      return students.filter((student) => assignments.some((assignment) =>
        assignment.schoolClassId === student.currentClassId &&
        store.enrollments.some((enrollment) => enrollment.studentId === student.id &&
          enrollment.schoolClassId === assignment.schoolClassId &&
          enrollment.academicYearId === assignment.academicYearId &&
          enrollment.status === 'ACTIVE'),
      ));
    }

    return students;
  }

  static async getStudentById(id: string): Promise<StudentRecord | null> {
    const student = (await this.getAllStudents()).find((record) => record.id === id);
    return student ?? null;
  }

  static async create(input: StudentInput): Promise<StudentRecord> {
    assertPermission(permissions.studentsManage);
    const actor = useAuthStore.getState().user;
    const store = MockDatabase.getStore();
    const schoolClass = store.classes.find((item) => item.id === input.currentClassId && item.tenantId === actor?.tenantId);
    const guardian = store.users.find((item) => item.id === input.guardianId && item.tenantId === actor?.tenantId && item.role === 'PARENT');
    if (!actor?.tenantId || !schoolClass || !guardian) throw new Error('Choose a valid class and parent account.');
    const timestamp = new Date().toISOString();
    const id = `student-${globalThis.crypto.randomUUID()}`;
    const enrollmentId = `enrollment-${globalThis.crypto.randomUUID()}`;
    const student: StudentRecord = {
      id, studentId: `CP-${Date.now().toString().slice(-6)}`, tenantId: actor.tenantId,
      firstName: input.firstName.trim(), middleName: input.middleName?.trim(), lastName: input.lastName.trim(),
      gender: input.gender, dateOfBirth: input.dateOfBirth, guardianId: guardian.id,
      currentClassId: schoolClass.id, enrollmentId, status: 'ACTIVE', createdAt: timestamp, updatedAt: timestamp,
    };
    const enrollment: EnrollmentRecord = {
      id: enrollmentId, tenantId: actor.tenantId, studentId: id, schoolClassId: schoolClass.id,
      academicYearId: schoolClass.academicYearId, status: 'ACTIVE', enrolledAt: timestamp, createdAt: timestamp,
    };
    store.students.push(student);
    store.enrollments.push(enrollment);
    MockDatabase.saveStore(store);
    AuditRepository.create({ tenantId: actor.tenantId, userId: actor.id, action: 'CREATE', entityType: 'STUDENT', entityId: id });
    return student;
  }

  static async update(id: string, input: Partial<StudentInput>): Promise<StudentRecord> {
    assertPermission(permissions.studentsManage);
    const actor = useAuthStore.getState().user;
    const store = MockDatabase.getStore();
    const student = store.students.find((item) => item.id === id && item.tenantId === actor?.tenantId);
    if (!student || !actor) throw new Error('Student not found');
    const tenantId = actor.tenantId;
    if (!tenantId) throw new Error('Student not found');
    if (input.guardianId && !store.users.some((item) => item.id === input.guardianId && item.tenantId === actor.tenantId && item.role === 'PARENT')) throw new Error('Choose a valid parent account.');
    if (input.currentClassId && !store.classes.some((item) => item.id === input.currentClassId && item.tenantId === actor.tenantId)) throw new Error('Choose a valid class.');
    const updated: StudentRecord = { ...student, ...input, tenantId: student.tenantId, updatedAt: new Date().toISOString() };
    store.students = store.students.map((item) => item.id === id ? updated : item);
    if (input.currentClassId) {
      const selectedClass = store.classes.find((item) => item.id === input.currentClassId)!;
      store.enrollments = store.enrollments.map((item) => item.id === student.enrollmentId
        ? { ...item, schoolClassId: selectedClass.id, academicYearId: selectedClass.academicYearId, updatedAt: updated.updatedAt }
        : item);
    }
    MockDatabase.saveStore(store);
    AuditRepository.create({ tenantId, userId: actor.id, action: 'UPDATE', entityType: 'STUDENT', entityId: id });
    return updated;
  }
}
