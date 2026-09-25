import { StudentService } from '../services/student-service';
import { StudentRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class StudentAdapter {
  static async getStudents(): Promise<StudentRecord[]> {
    MockDatabase.initializeStore();
    return StudentService.getAllStudents();
  }

  static async getStudent(id: string): Promise<StudentRecord | null> {
    MockDatabase.initializeStore();
    return StudentService.getStudentById(id);
  }
}
