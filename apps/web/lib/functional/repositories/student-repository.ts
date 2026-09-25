import { StudentRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class StudentRepository {
  static findAll(): StudentRecord[] {
    return MockDatabase.getCollection('students');
  }

  static findById(id: string): StudentRecord | undefined {
    return this.findAll().find(student => student.id === id);
  }

  static save(student: StudentRecord): StudentRecord {
    const students = this.findAll();
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    MockDatabase.setCollection('students', students);
    return student;
  }
}
