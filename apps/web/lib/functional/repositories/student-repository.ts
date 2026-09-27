import { StudentRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class StudentRepository {
  static findAll(): StudentRecord[] {
    return MockDatabase.getStore().students;
  }

  static findById(id: string): StudentRecord | undefined {
    return this.findAll().find(student => student.id === id);
  }

  static save(student: StudentRecord): StudentRecord {
    const store = MockDatabase.getStore();
    const students = store.students;
    const index = students.findIndex(s => s.id === student.id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }
    store.students = students;
    MockDatabase.saveStore(store);
    return student;
  }
}
