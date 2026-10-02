import { MockDatabase } from '../storage/database';
import { AttendanceRecord } from '../types';

export class AttendanceRepository {
  static findByTerm(termId: string): AttendanceRecord[] { return MockDatabase.getStore().attendance.filter((item) => item.termId === termId); }
  static findById(id: string): AttendanceRecord | undefined { return MockDatabase.getStore().attendance.find((item) => item.id === id); }
  static save(record: AttendanceRecord): AttendanceRecord {
    const store = MockDatabase.getStore();
    const index = store.attendance.findIndex((item) => item.id === record.id);
    if (index < 0) store.attendance.push(record); else store.attendance[index] = record;
    MockDatabase.saveStore(store);
    return record;
  }
  static saveMany(records: AttendanceRecord[]): AttendanceRecord[] {
    const store = MockDatabase.getStore();
    store.attendance.push(...records);
    MockDatabase.saveStore(store);
    return records;
  }
}
