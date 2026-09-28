import { StudentService, StudentInput } from '../services/student-service';
import { StudentRecord } from '../types';

export class StudentAdapter {
  static async getStudents(): Promise<StudentRecord[]> {
    return StudentService.getAllStudents();
  }

  static async getStudent(id: string): Promise<StudentRecord | null> {
    return StudentService.getStudentById(id);
  }
  static create(input: StudentInput) { return StudentService.create(input); }
  static update(id: string, input: Partial<StudentInput>) { return StudentService.update(id, input); }
}
