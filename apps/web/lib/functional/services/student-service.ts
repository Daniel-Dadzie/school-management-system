import { StudentRepository } from '../repositories/student-repository';
import { StudentRecord } from '../types';
import { assertPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';

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
}
