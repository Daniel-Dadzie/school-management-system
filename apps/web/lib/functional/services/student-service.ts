import { StudentRepository } from '../repositories/student-repository';
import { StudentRecord } from '../types';

export class StudentService {
  static async getAllStudents(): Promise<StudentRecord[]> {
    return StudentRepository.findAll();
  }

  static async getStudentById(id: string): Promise<StudentRecord | null> {
    const student = StudentRepository.findById(id);
    return student || null;
  }
}
