/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
// @ts-nocheck
import { LocalStorageAdapter } from './local-storage-adapter';
import { MockStore } from '../types';
import { defaultTenant, defaultUsers, defaultTeacherProfiles, defaultStudents, defaultClasses, defaultAuditLogs, defaultSubjects, defaultAcademicYears, defaultTerms, defaultTeacherAssignments, defaultEnrollments, defaultAdmissions, defaultAttendance, defaultAssessments, defaultAssessmentResults, defaultAssessmentCategories, defaultGradeScales, defaultSettings, defaultFeeStructures, defaultFeeItems, defaultStudentCharges, defaultInvoices, defaultInvoiceLineItems, defaultPayments } from '../seed/seed-data';

const STORE_KEY = 'carepoint_mock_store';
const CURRENT_VERSION = 7;

const hasBaseStoreShape = (value: unknown): value is Partial<MockStore> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const store = value as Record<string, unknown>;
  return (store.version === 3 || store.version === 4 || store.version === CURRENT_VERSION) &&
    Array.isArray(store.tenants) && Array.isArray(store.users) &&
    Array.isArray(store.students) && Array.isArray(store.classes) &&
    Array.isArray(store.auditEvents) && Array.isArray(store.notifications);
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
  feeStructures: [...defaultFeeStructures], feeItems: [...defaultFeeItems], studentCharges: [...defaultStudentCharges], invoices: [...defaultInvoices], invoiceLineItems: [...defaultInvoiceLineItems], payments: [...defaultPayments], paymentPlans: [], paymentInstallments: [], feeAdjustments: [], reconciliations: [], familyWallets: [], familyWalletTransactions: [],
  reportCardConfigurations: [],
  reportCardComments: [],
  incidents: [
    { id: "inc-1", tenantId: "tenant-1", title: "Classroom Disruption", description: "Student repeatedly disrupted class during mathematics lesson.", category: "BEHAVIOUR", severity: "LOW", status: "RESOLVED", studentId: "1", reportedBy: "3", actionTaken: "Verbal warning issued. Parent notified.", resolvedBy: "3", resolvedAt: new Date(Date.now() - 86400000 * 5).toISOString(), createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "inc-2", tenantId: "tenant-1", title: "Alleged Bullying Incident", description: "A student reported being bullied during lunch break. Under investigation.", category: "BULLYING", severity: "HIGH", status: "INVESTIGATING", studentId: "2", reportedBy: "3", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: "inc-3", tenantId: "tenant-1", title: "Cheating on Assessment", description: "Student found copying answers during end-of-term science assessment.", category: "ACADEMIC_DISHONESTY", severity: "MEDIUM", status: "CLOSED", studentId: "1", reportedBy: "3", actionTaken: "Assessment score voided. Suspension for 1 day.", resolvedBy: "2", resolvedAt: new Date(Date.now() - 86400000 * 10).toISOString(), createdAt: new Date(Date.now() - 86400000 * 12).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: "inc-4", tenantId: "tenant-1", title: "Property Damage", description: "Student accidentally broke a classroom window during break time.", category: "PROPERTY_DAMAGE", severity: "MEDIUM", status: "OPEN", studentId: "2", reportedBy: "4", createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  calendarEvents: [
    { id: "evt-1", tenantId: "tenant-1", title: "Term 1 Begins", type: "OTHER", startDate: "2026-09-01", endDate: "2026-09-01", allDay: true, createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-2", tenantId: "tenant-1", title: "Independence Day Holiday", type: "HOLIDAY", startDate: "2026-09-21", endDate: "2026-09-21", allDay: true, description: "National holiday - no classes.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-3", tenantId: "tenant-1", title: "Mid-Term Examinations", type: "EXAM", startDate: "2026-10-05", endDate: "2026-10-09", allDay: true, description: "All classes. Exam timetable distributed separately.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-4", tenantId: "tenant-1", title: "Parent-Teacher Conference", type: "MEETING", startDate: "2026-10-15", endDate: "2026-10-15", allDay: false, location: "School Hall", description: "All parents are invited.", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-5", tenantId: "tenant-1", title: "Annual Sports Day", type: "SPORTS", startDate: "2026-11-08", endDate: "2026-11-08", allDay: true, location: "Sports Field", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-6", tenantId: "tenant-1", title: "Cultural Day and Prize Giving", type: "CULTURAL", startDate: "2026-11-20", endDate: "2026-11-20", allDay: true, location: "Main Hall", createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "evt-7", tenantId: "tenant-1", title: "End of Term 1", type: "OTHER", startDate: "2026-11-28", endDate: "2026-11-28", allDay: true, createdBy: "2", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ],
  notifications: [
    { id: 'notif-1', tenantId: 'tenant-1', userId: '5', title: 'Welcome to CarePoint SMS', message: 'Welcome to the new CarePoint School Management System parent portal. Here you can track your children\'s performance, fees, and more.', status: 'UNREAD', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'notif-2', tenantId: 'tenant-1', userId: '5', title: 'New Invoice Issued', message: 'A new invoice for Term 1 Tuition has been issued for Emily Chen.', status: 'UNREAD', createdAt: new Date().toISOString(), link: '/parent-children/1/fees' },
    { id: 'notif-3', tenantId: 'tenant-1', userId: '5', title: 'End of Term Report Available', message: 'The End of Term Report for Michael Chen is now available for viewing and download.', status: 'READ', createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/parent-children/2/report-card' },
  ],
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
        Array.isArray(data.studentCharges) && Array.isArray(data.invoices) && Array.isArray(data.invoiceLineItems) &&
        Array.isArray(data.payments) && Array.isArray(data.paymentPlans) && Array.isArray(data.paymentInstallments) && Array.isArray(data.feeAdjustments) && Array.isArray(data.reconciliations) && Array.isArray(data.notifications) && Array.isArray(data.incidents) && Array.isArray(data.calendarEvents) &&
        Array.isArray(data.reportCardConfigurations) && Array.isArray(data.reportCardComments) && data.version === CURRENT_VERSION;
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
        payments: Array.isArray(data.payments) && Array.isArray(data.reportCardConfigurations) && Array.isArray(data.reportCardComments) && Array.isArray(data.notifications) ? data.payments : seeds.payments,
        paymentPlans: Array.isArray(data.paymentPlans) ? data.paymentPlans : seeds.paymentPlans,
        paymentInstallments: Array.isArray(data.paymentInstallments) ? data.paymentInstallments : seeds.paymentInstallments,
        feeAdjustments: Array.isArray(data.feeAdjustments) ? data.feeAdjustments : seeds.feeAdjustments,
        reconciliations: Array.isArray(data.reconciliations) ? data.reconciliations : seeds.reconciliations,
        familyWallets: Array.isArray(data.familyWallets) ? data.familyWallets : seeds.familyWallets,
        familyWalletTransactions: Array.isArray(data.familyWalletTransactions) ? data.familyWalletTransactions : seeds.familyWalletTransactions,
        notifications: Array.isArray(data.notifications) ? data.notifications : seeds.notifications,
        incidents: Array.isArray(data.incidents) ? data.incidents : seeds.incidents,
        calendarEvents: Array.isArray(data.calendarEvents) ? data.calendarEvents : seeds.calendarEvents,
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









