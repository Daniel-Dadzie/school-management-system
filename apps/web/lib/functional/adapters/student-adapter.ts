import { StudentService } from '../services/student-service';
import { StudentRecord } from '../types';

export class StudentAdapter {
  static async getStudents(): Promise<StudentRecord[]> {
    return StudentService.getAllStudents();
  }

  static async getStudent(id: string): Promise<StudentRecord | null> {
    return StudentService.getStudentById(id);
  }
}
