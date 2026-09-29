import { LocalStorageAdapter } from './local-storage-adapter';
import { MockStore } from '../types';
import { defaultTenant, defaultUsers, defaultTeacherProfiles, defaultStudents, defaultClasses, defaultAuditLogs, defaultSubjects, defaultAcademicYears, defaultTerms, defaultTeacherAssignments, defaultEnrollments, defaultAdmissions, defaultAttendance, defaultAssessments, defaultAssessmentResults, defaultAssessmentCategories, defaultGradeScales, defaultSettings, defaultFeeStructures, defaultFeeItems, defaultStudentCharges, defaultInvoices, defaultInvoiceLineItems, defaultPayments } from '../seed/seed-data';

const STORE_KEY = 'carepoint_mock_store';
const CURRENT_VERSION = 6;

const hasBaseStoreShape = (value: unknown): value is Partial<MockStore> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const store = value as Record<string, unknown>;
  return (store.version === 3 || store.version === 4 || store.version === CURRENT_VERSION) &&
    Array.isArray(store.tenants) && Array.isArray(store.users) &&
    Array.isArray(store.students) && Array.isArray(store.classes) &&
    Array.isArray(store.auditEvents);
};

const createSeedStore = (): MockStore => ({
  version: CURRENT_VERSION,
  tenants: [defaultTenant],
  users: [...defaultUsers],
  teacherProfiles: [...defaultTeacherProfiles],
  students: [...defaultStudents],
  classes: [...defaultClasses],
  auditEvents: [...defaultAuditLogs],
  subjects: [...defaultSubjects],
  academicYears: [...defaultAcademicYears],
  terms: [...defaultTerms],
  teacherAssignments: [...defaultTeacherAssignments],
  enrollments: [...defaultEnrollments],
  promotionRecords: [],
  admissions: [...defaultAdmissions],
  attendance: [...defaultAttendance],
  assessments: [...defaultAssessments],
  assessmentResults: [...defaultAssessmentResults],
  assessmentCategories: [...defaultAssessmentCategories],
  gradeScales: [...defaultGradeScales],
  settings: [...defaultSettings],
  feeStructures: [...defaultFeeStructures], feeItems: [...defaultFeeItems], studentCharges: [...defaultStudentCharges], invoices: [...defaultInvoices], invoiceLineItems: [...defaultInvoiceLineItems], payments: [...defaultPayments],
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
        Array.isArray(data.settings) && Array.isArray(data.teacherProfiles) &&
        Array.isArray(data.assessmentCategories) && Array.isArray(data.gradeScales) &&
        Array.isArray(data.promotionRecords) && Array.isArray(data.feeStructures) && Array.isArray(data.feeItems) &&
        Array.isArray(data.studentCharges) && Array.isArray(data.invoices) && Array.isArray(data.invoiceLineItems) && Array.isArray(data.payments) && Array.isArray(data.reportCardConfigurations) && Array.isArray(data.reportCardComments) && data.version === CURRENT_VERSION;
      const assessmentRowsNeedMigration = Array.isArray(data.assessments) && data.assessments.some((assessment) => {
        const row = assessment as MockStore['assessments'][number];
        return !row.categoryId || !row.assessmentDate || row.maximumScore === undefined || row.weightPercent === undefined;
      });
      const resultRowsNeedMigration = Array.isArray(data.assessmentResults) && data.assessmentResults.some((result) => {
        const row = result as MockStore['assessmentResults'][number];
        return !row.status || (row.status === 'FINALIZED' && !row.gradingScaleId);
      });
      if (hasDomainCollections && !assessmentRowsNeedMigration && !resultRowsNeedMigration) return data as MockStore;

      const seeds = createSeedStore();
      const storedAcademicYears = Array.isArray(data.academicYears) ? data.academicYears : seeds.academicYears;
      const storedClasses = Array.isArray(data.classes) ? data.classes : seeds.classes;
      const store: MockStore = {
        ...seeds,
        ...data,
        version: CURRENT_VERSION,
        teacherProfiles: Array.isArray(data.teacherProfiles) ? data.teacherProfiles : seeds.teacherProfiles,
        subjects: Array.isArray(data.subjects) ? data.subjects : seeds.subjects,
        terms: Array.isArray(data.terms) ? data.terms : seeds.terms,
        teacherAssignments: Array.isArray(data.teacherAssignments) ? data.teacherAssignments : seeds.teacherAssignments,
        enrollments: Array.isArray(data.enrollments) ? data.enrollments : seeds.enrollments,
        promotionRecords: Array.isArray(data.promotionRecords) ? data.promotionRecords : [],
        academicYears: [...storedAcademicYears, ...seeds.academicYears.filter((seed) => !storedAcademicYears.some((item) => item.id === seed.id))],
        classes: [...storedClasses, ...seeds.classes.filter((seed) => !storedClasses.some((item) => item.id === seed.id))],
        admissions: Array.isArray(data.admissions) ? data.admissions : seeds.admissions,
        attendance: Array.isArray(data.attendance) ? data.attendance : seeds.attendance,
        assessments: Array.isArray(data.assessments) ? data.assessments.map((assessment) => {
          const term = (Array.isArray(data.terms) ? data.terms : seeds.terms).find((item) => item.id === assessment.termId);
          const date = assessment.assessmentDate ?? assessment.createdAt.slice(0, 10);
          const safeDate = term && date >= term.startDate.slice(0, 10) && date <= term.endDate.slice(0, 10) ? date : term?.startDate.slice(0, 10) ?? date;
          return { ...assessment, categoryId: assessment.categoryId ?? 'category-other', assessmentDate: safeDate, maximumScore: assessment.maximumScore ?? 100, weightPercent: assessment.weightPercent ?? 100 };
        }) : seeds.assessments,
        assessmentResults: Array.isArray(data.assessmentResults) ? data.assessmentResults.map((result) => {
          const assessment = (Array.isArray(data.assessments) ? data.assessments : seeds.assessments).find((item) => item.id === result.assessmentId);
          const term = assessment && (Array.isArray(data.terms) ? data.terms : seeds.terms).find((item) => item.id === assessment.termId);
          const scale = term && (Array.isArray(data.gradeScales) ? data.gradeScales : seeds.gradeScales).find((item) => item.tenantId === result.tenantId && item.academicYearId === term.academicYearId && item.isActive);
          const status = result.status ?? 'ENTERED';
          return { ...result, status, gradingScaleId: result.gradingScaleId ?? (status === 'FINALIZED' ? scale?.id : undefined) };
        }) : seeds.assessmentResults,
        assessmentCategories: Array.isArray(data.assessmentCategories) ? data.assessmentCategories : seeds.assessmentCategories,
        gradeScales: Array.isArray(data.gradeScales) ? data.gradeScales : seeds.gradeScales,
        settings: Array.isArray(data.settings) ? data.settings : seeds.settings,
        feeStructures: Array.isArray(data.feeStructures) ? data.feeStructures : seeds.feeStructures,
        feeItems: Array.isArray(data.feeItems) ? data.feeItems : seeds.feeItems,
        studentCharges: Array.isArray(data.studentCharges) ? data.studentCharges : seeds.studentCharges,
        invoices: Array.isArray(data.invoices) ? data.invoices : seeds.invoices,
        invoiceLineItems: Array.isArray(data.invoiceLineItems) ? data.invoiceLineItems : seeds.invoiceLineItems,
        payments: Array.isArray(data.payments) && Array.isArray(data.reportCardConfigurations) && Array.isArray(data.reportCardComments) ? data.payments : seeds.payments,
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




