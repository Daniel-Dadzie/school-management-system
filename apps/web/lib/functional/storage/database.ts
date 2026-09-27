import { LocalStorageAdapter } from './local-storage-adapter';
import { MockStore } from '../types';
import { defaultTenant, defaultUsers, defaultStudents, defaultClasses, defaultAuditLogs, defaultSubjects, defaultAcademicYears, defaultTerms, defaultTeacherAssignments, defaultEnrollments, defaultAdmissions, defaultAttendance, defaultAssessments, defaultAssessmentResults, defaultSettings } from '../seed/seed-data';

const STORE_KEY = 'carepoint_mock_store';
const CURRENT_VERSION = 3;

const hasBaseStoreShape = (value: unknown): value is Partial<MockStore> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const store = value as Record<string, unknown>;
  return store.version === CURRENT_VERSION &&
    Array.isArray(store.tenants) && Array.isArray(store.users) &&
    Array.isArray(store.students) && Array.isArray(store.classes) &&
    Array.isArray(store.auditEvents);
};

const createSeedStore = (): MockStore => ({
  version: CURRENT_VERSION,
  tenants: [defaultTenant],
  users: [...defaultUsers],
  students: [...defaultStudents],
  classes: [...defaultClasses],
  auditEvents: [...defaultAuditLogs],
  subjects: [...defaultSubjects],
  academicYears: [...defaultAcademicYears],
  terms: [...defaultTerms],
  teacherAssignments: [...defaultTeacherAssignments],
  enrollments: [...defaultEnrollments],
  admissions: [...defaultAdmissions],
  attendance: [...defaultAttendance],
  assessments: [...defaultAssessments],
  assessmentResults: [...defaultAssessmentResults],
  settings: [...defaultSettings],
});

export class MockDatabase {
  static getStore(): MockStore {
    const raw = LocalStorageAdapter.getItem(STORE_KEY);
    if (!raw) {
      return this.initializeStore();
    }
    try {
      const data: unknown = JSON.parse(raw);
      if (!hasBaseStoreShape(data)) {
        return this.initializeStore();
      }
      const hasDomainCollections = Array.isArray(data.subjects) &&
        Array.isArray(data.academicYears) && Array.isArray(data.terms) &&
        Array.isArray(data.teacherAssignments) && Array.isArray(data.enrollments) &&
        Array.isArray(data.admissions) && Array.isArray(data.attendance) &&
        Array.isArray(data.assessments) && Array.isArray(data.assessmentResults) &&
        Array.isArray(data.settings);
      if (hasDomainCollections) return data as MockStore;

      const seeds = createSeedStore();
      const store: MockStore = {
        ...seeds,
        ...data,
        version: CURRENT_VERSION,
        subjects: Array.isArray(data.subjects) ? data.subjects : seeds.subjects,
        academicYears: Array.isArray(data.academicYears) ? data.academicYears : seeds.academicYears,
        terms: Array.isArray(data.terms) ? data.terms : seeds.terms,
        teacherAssignments: Array.isArray(data.teacherAssignments) ? data.teacherAssignments : seeds.teacherAssignments,
        enrollments: Array.isArray(data.enrollments) ? data.enrollments : seeds.enrollments,
        admissions: Array.isArray(data.admissions) ? data.admissions : seeds.admissions,
        attendance: Array.isArray(data.attendance) ? data.attendance : seeds.attendance,
        assessments: Array.isArray(data.assessments) ? data.assessments : seeds.assessments,
        assessmentResults: Array.isArray(data.assessmentResults) ? data.assessmentResults : seeds.assessmentResults,
        settings: Array.isArray(data.settings) ? data.settings : seeds.settings,
      };
      this.saveStore(store);
      return store;
    } catch {
      return this.initializeStore();
    }
  }

  static saveStore(store: MockStore): void {
    LocalStorageAdapter.setItem(STORE_KEY, JSON.stringify(store));
  }

  static initializeStore(): MockStore {
    const initialStore = createSeedStore();
    this.saveStore(initialStore);
    return initialStore;
  }

  static getCollection<K extends keyof Omit<MockStore, 'version'>>(key: K): MockStore[K] {
    const store = this.getStore();
    return store[key];
  }

  static setCollection<K extends keyof Omit<MockStore, 'version'>>(key: K, data: MockStore[K]): void {
    const store = this.getStore();
    store[key] = data;
    this.saveStore(store);
  }
}


