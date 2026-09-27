import { MockDatabase } from '../storage/database';
import { AttendanceRecord } from '../types';

export class AttendanceRepository {
  static findByTerm(termId: string): AttendanceRecord[] { return MockDatabase.getStore().attendance.filter((item) => item.termId === termId); }
}
