import { MockDatabase } from '../storage/database';
import { AcademicYearRecord, EnrollmentRecord, SubjectRecord, TeacherAssignmentRecord, TermRecord, ClassRecord } from '../types';

export class AcademicRepository {
  static years(): AcademicYearRecord[] { return MockDatabase.getStore().academicYears; }
  static terms(academicYearId: string): TermRecord[] { return MockDatabase.getStore().terms.filter((item) => item.academicYearId === academicYearId); }
  static classes(): ClassRecord[] { return MockDatabase.getStore().classes; }
  static subjects(): SubjectRecord[] { return MockDatabase.getStore().subjects; }
  static assignments(): TeacherAssignmentRecord[] { return MockDatabase.getStore().teacherAssignments; }
  static enrollments(): EnrollmentRecord[] { return MockDatabase.getStore().enrollments; }
  static save<K extends 'academicYears' | 'terms' | 'classes' | 'subjects' | 'teacherAssignments' | 'enrollments'>(key: K, records: ReturnType<typeof MockDatabase.getStore>[K]): void {
    const store = MockDatabase.getStore();
    store[key] = records;
    MockDatabase.saveStore(store);
  }
}
