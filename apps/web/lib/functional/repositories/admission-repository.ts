import { MockDatabase } from '../storage/database';
import { AdmissionApplicationRecord } from '../types';

export class AdmissionRepository {
  static findAll(): AdmissionApplicationRecord[] { return MockDatabase.getStore().admissions; }
  static findById(id: string): AdmissionApplicationRecord | undefined { return this.findAll().find((item) => item.id === id); }
  static save(record: AdmissionApplicationRecord): AdmissionApplicationRecord {
    const store = MockDatabase.getStore();
    const index = store.admissions.findIndex((item) => item.id === record.id);
    if (index < 0) store.admissions.push(record); else store.admissions[index] = record;
    MockDatabase.saveStore(store);
    return record;
  }
}
