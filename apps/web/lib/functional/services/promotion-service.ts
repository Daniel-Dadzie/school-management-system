import { assertPermission, AuthorizationError, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { MockDatabase } from '../storage/database';
import type { EnrollmentRecord, PromotionDecision, PromotionRecord, StudentReportCard } from '../types';
import { StudentResultService } from './student-result-service';

export interface PromotionCandidate {
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  sourceEnrollmentId: string;
  alreadyEnrolled: boolean;
  academicSummary?: { termName: string; averagePercentage?: number; completedSubjects: number; subjects: Array<{ name: string; percentage: number; grade?: string }>; attendance: StudentReportCard['attendance'] };
}

export interface PromotionWorkspace {
  academicYears: Array<{ id: string; name: string; startDate: string; endDate: string }>;
  classes: Array<{ id: string; name: string; gradeLevel: string; academicYearId: string }>;
  sourceClassId: string;
  destinationAcademicYearId?: string;
  candidates: PromotionCandidate[];
}

export interface PromotionReferences {
  academicYears: PromotionWorkspace['academicYears'];
  classes: PromotionWorkspace['classes'];
}

export interface PromotionInput {
  studentId: string;
  sourceEnrollmentId: string;
  destinationClassId: string;
  decision: PromotionDecision;
}

export interface AcademicHistoryEntry {
  enrollmentId: string;
  academicYearName: string;
  yearStartDate: string;
  className: string;
  status: EnrollmentRecord['status'];
  decision?: PromotionDecision;
  notes?: string;
  decidedAt?: string;
}

const currentUser = () => useAuthStore.getState().user;
const compareYears = (a: { startDate: string }, b: { startDate: string }) => a.startDate.localeCompare(b.startDate);

export class PromotionService {
  private static assertAdmin(): NonNullable<ReturnType<typeof currentUser>> {
    const actor = currentUser();
    if (actor?.role !== 'ADMIN' || !actor.tenantId) throw new AuthorizationError();
    assertPermission(permissions.promotionsManage);
    return actor;
  }

  static references(): PromotionReferences {
    const actor = this.assertAdmin();
    const store = MockDatabase.getStore();
    return {
      academicYears: store.academicYears.filter((year) => year.tenantId === actor.tenantId).sort(compareYears).map(({ id, name, startDate, endDate }) => ({ id, name, startDate, endDate })),
      classes: store.classes.filter((schoolClass) => schoolClass.tenantId === actor.tenantId).map(({ id, name, gradeLevel, academicYearId }) => ({ id, name, gradeLevel, academicYearId })),
    };
  }

  static workspace(academicYearId: string, sourceClassId: string): PromotionWorkspace {
    const actor = this.assertAdmin();
    const store = MockDatabase.getStore();
    const tenantYears = store.academicYears.filter((year) => year.tenantId === actor.tenantId).sort(compareYears);
    const sourceYearIndex = tenantYears.findIndex((year) => year.id === academicYearId);
    const sourceYear = tenantYears[sourceYearIndex];
    const sourceClass = store.classes.find((schoolClass) => schoolClass.id === sourceClassId && schoolClass.tenantId === actor.tenantId && schoolClass.academicYearId === academicYearId);
    if (!sourceYear || !sourceClass) throw new Error('Choose a valid academic year and class.');
    const destinationYear = tenantYears[sourceYearIndex + 1];
    const sourceEnrollments = store.enrollments.filter((enrollment) => enrollment.tenantId === actor.tenantId && enrollment.academicYearId === academicYearId && enrollment.schoolClassId === sourceClassId && enrollment.status === 'ACTIVE');
    const candidates = sourceEnrollments.flatMap((enrollment) => {
      const student = store.students.find((record) => record.id === enrollment.studentId && record.tenantId === actor.tenantId && record.status === 'ACTIVE');
      if (!student) return [];
      const currentTargetEnrollment = destinationYear && store.enrollments.find((record) => record.tenantId === actor.tenantId && record.studentId === student.id && record.academicYearId === destinationYear.id && (record.status === 'ACTIVE' || record.status === 'SUSPENDED'));
      let academicSummary: PromotionCandidate['academicSummary'];
      const terms = store.terms.filter((term) => term.tenantId === actor.tenantId && term.academicYearId === academicYearId).sort((a, b) => b.endDate.localeCompare(a.endDate));
      const lastTerm = terms[0];
      if (lastTerm) {
        try {
          const report = StudentResultService.reportCard(student.id, academicYearId, lastTerm.id);
          const completed = report.subjects.filter((subject) => subject.isComplete && subject.totalPercentage !== undefined);
          academicSummary = {
            termName: lastTerm.name,
            averagePercentage: completed.length ? Math.round(completed.reduce((sum, subject) => sum + (subject.totalPercentage ?? 0), 0) / completed.length * 100) / 100 : undefined,
            completedSubjects: completed.length,
            subjects: completed.map((subject) => ({ name: subject.subjectName, percentage: subject.totalPercentage ?? 0, grade: subject.grade })),
            attendance: report.attendance,
          };
        } catch {
          academicSummary = undefined;
        }
      }
      return [{
        studentId: student.id,
        studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' '),
        admissionNumber: student.studentId,
        sourceEnrollmentId: enrollment.id,
        alreadyEnrolled: Boolean(currentTargetEnrollment),
        academicSummary,
      }];
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
    return {
      academicYears: tenantYears.map(({ id, name, startDate, endDate }) => ({ id, name, startDate, endDate })),
      classes: store.classes.filter((schoolClass) => schoolClass.tenantId === actor.tenantId).map(({ id, name, gradeLevel, academicYearId: yearId }) => ({ id, name, gradeLevel, academicYearId: yearId })),
      sourceClassId,
      destinationAcademicYearId: destinationYear?.id,
      candidates,
    };
  }

  static history(studentId: string): AcademicHistoryEntry[] {
    const actor = currentUser();
    if (!actor?.tenantId || (actor.role !== 'ADMIN' && actor.role !== 'PARENT')) throw new AuthorizationError();
    if (actor.role === 'ADMIN') assertPermission(permissions.promotionsManage);
    if (actor.role === 'PARENT') assertPermission(permissions.parentChildrenView);
    const store = MockDatabase.getStore();
    const student = store.students.find((record) => record.id === studentId && record.tenantId === actor.tenantId && (actor.role !== 'PARENT' || record.guardianId === actor.id));
    if (!student) throw new Error('Student record not found.');
    return store.enrollments.filter((enrollment) => enrollment.studentId === student.id && enrollment.tenantId === actor.tenantId)
      .map((enrollment) => {
        const year = store.academicYears.find((record) => record.id === enrollment.academicYearId && record.tenantId === actor.tenantId);
        const schoolClass = store.classes.find((record) => record.id === enrollment.schoolClassId && record.tenantId === actor.tenantId);
        const promotion: PromotionRecord | undefined = store.promotionRecords.find((record) => record.toEnrollmentId === enrollment.id && record.tenantId === actor.tenantId);
        return {
          enrollmentId: enrollment.id,
          academicYearName: year?.name ?? 'Academic year unavailable',
          yearStartDate: year?.startDate ?? enrollment.createdAt,
          className: schoolClass?.name ?? 'Class unavailable',
          status: enrollment.status,
          decision: promotion?.decision,
          notes: actor.role === 'ADMIN' ? promotion?.notes : undefined,
          decidedAt: promotion?.decidedAt,
        };
      }).sort((a, b) => a.yearStartDate.localeCompare(b.yearStartDate));
  }

  static initiate(input: { sourceAcademicYearId: string; sourceClassId: string; records: PromotionInput[] }): void {
    const actor = this.assertAdmin();
    const tenantId = actor.tenantId;
    if (!tenantId || !input.records.length) throw new Error('Select at least one student to review.');
    if (new Set(input.records.map((record) => record.studentId)).size !== input.records.length) throw new Error('A student can only be included once.');
    const store = MockDatabase.getStore();
    const years = store.academicYears.filter((year) => year.tenantId === tenantId).sort(compareYears);
    const sourceIndex = years.findIndex((year) => year.id === input.sourceAcademicYearId);
    const sourceYear = years[sourceIndex];
    const destinationYear = years[sourceIndex + 1];
    const sourceClass = store.classes.find((schoolClass) => schoolClass.id === input.sourceClassId && schoolClass.tenantId === tenantId && schoolClass.academicYearId === sourceYear?.id);
    if (!sourceYear || !destinationYear || destinationYear.startDate <= sourceYear.endDate || !sourceClass) throw new Error('A valid next academic year and source class are required.');
    for (const record of input.records) {
      const studentExists = store.students.some((student) => student.id === record.studentId && student.tenantId === tenantId && student.status === 'ACTIVE');
      const sourceEnrollmentExists = store.enrollments.some((enrollment) => enrollment.id === record.sourceEnrollmentId && enrollment.studentId === record.studentId && enrollment.tenantId === tenantId && enrollment.academicYearId === sourceYear.id && enrollment.schoolClassId === sourceClass.id && enrollment.status === 'ACTIVE');
      const destinationExists = store.classes.some((schoolClass) => schoolClass.id === record.destinationClassId && schoolClass.tenantId === tenantId && schoolClass.academicYearId === destinationYear.id);
      const conflictingSourceEnrollment = store.enrollments.some((enrollment) => enrollment.studentId === record.studentId && enrollment.tenantId === tenantId && enrollment.academicYearId === sourceYear.id && enrollment.id !== record.sourceEnrollmentId && (enrollment.status === 'ACTIVE' || enrollment.status === 'SUSPENDED'));
      if (!studentExists || !sourceEnrollmentExists || conflictingSourceEnrollment || !destinationExists || (record.decision !== 'PROMOTE' && record.decision !== 'RETAIN')) throw new Error('Refresh and select valid students and destination classes before review.');
    }
    store.auditEvents.push({
      id: `audit-${globalThis.crypto.randomUUID()}`,
      tenantId,
      userId: actor.id,
      action: 'CREATE',
      entityType: 'PROMOTION_INITIATED',
      details: JSON.stringify({ sourceAcademicYearId: sourceYear.id, sourceClassId: sourceClass.id, destinationAcademicYearId: destinationYear.id, count: input.records.length, affectedStudentIds: input.records.slice(0, 20).map((record) => record.studentId), omittedStudentCount: Math.max(input.records.length - 20, 0) }),
      createdAt: new Date().toISOString(),
    });
    MockDatabase.saveStore(store);
  }

  static confirm(input: { sourceAcademicYearId: string; sourceClassId: string; records: PromotionInput[]; notes: string }): PromotionRecord[] {
    const actor = this.assertAdmin();
    const tenantId = actor.tenantId;
    if (!tenantId) throw new AuthorizationError();
    const notes = input.notes.trim();
    if (notes.length < 10 || notes.length > 500) throw new Error('Add a reason between 10 and 500 characters.');
    if (!input.records.length) throw new Error('Select at least one student.');
    const store = MockDatabase.getStore();
    const years = store.academicYears.filter((year) => year.tenantId === actor.tenantId).sort(compareYears);
    const sourceIndex = years.findIndex((year) => year.id === input.sourceAcademicYearId);
    const sourceYear = years[sourceIndex];
    const destinationYear = years[sourceIndex + 1];
    const sourceClass = store.classes.find((schoolClass) => schoolClass.id === input.sourceClassId && schoolClass.tenantId === actor.tenantId && schoolClass.academicYearId === sourceYear?.id);
    if (!sourceYear || !destinationYear || !sourceClass || destinationYear.startDate <= sourceYear.endDate) throw new Error('A valid, non-overlapping next academic year and source class are required.');
    if (new Set(input.records.map((record) => record.studentId)).size !== input.records.length) throw new Error('A student can only be included once.');

    const timestamp = new Date().toISOString();
    const created: PromotionRecord[] = input.records.map((item) => {
      const student = store.students.find((record) => record.id === item.studentId && record.tenantId === tenantId && record.status === 'ACTIVE');
      const fromEnrollment = store.enrollments.find((record) => record.id === item.sourceEnrollmentId && record.studentId === item.studentId && record.tenantId === tenantId && record.academicYearId === sourceYear.id && record.schoolClassId === sourceClass.id && record.status === 'ACTIVE');
      const destination = store.classes.find((record) => record.id === item.destinationClassId && record.tenantId === tenantId && record.academicYearId === destinationYear.id);
      const conflict = store.enrollments.some((record) => record.studentId === item.studentId && record.tenantId === tenantId && record.academicYearId === destinationYear.id && (record.status === 'ACTIVE' || record.status === 'SUSPENDED'));
      const conflictingSource = store.enrollments.some((record) => record.studentId === item.studentId && record.tenantId === tenantId && record.academicYearId === sourceYear.id && record.id !== item.sourceEnrollmentId && (record.status === 'ACTIVE' || record.status === 'SUSPENDED'));
      if (!student || !fromEnrollment || conflictingSource) throw new Error('A selected student no longer has one active enrollment in the source class. Refresh and review the list.');
      if (conflict) throw new Error('A selected student already has an active or suspended enrollment in the destination year.');
      if (!destination) throw new Error('Choose a class in the next academic year.');
      if (item.decision === 'RETAIN' && destination.gradeLevel !== sourceClass.gradeLevel) throw new Error('A retained student must remain at the same grade level.');
      if (item.decision !== 'PROMOTE' && item.decision !== 'RETAIN') throw new Error('Choose a supported promotion decision.');
      const enrollmentId = `enrollment-${globalThis.crypto.randomUUID()}`;
      return {
        id: `promotion-${globalThis.crypto.randomUUID()}`,
        tenantId,
        studentId: student.id,
        fromEnrollmentId: fromEnrollment.id,
        toEnrollmentId: enrollmentId,
        sourceAcademicYearId: sourceYear.id,
        academicYearId: destinationYear.id,
        fromClassId: sourceClass.id,
        destinationClassId: destination.id,
        decision: item.decision,
        notes,
        decidedBy: actor.id,
        decidedAt: timestamp,
        createdAt: timestamp,
      };
    });

    const destinationCounts = new Map<string, number>();
    for (const record of created) destinationCounts.set(record.destinationClassId, (destinationCounts.get(record.destinationClassId) ?? 0) + 1);
    for (const [destinationClassId, incomingCount] of destinationCounts) {
      const destination = store.classes.find((schoolClass) => schoolClass.id === destinationClassId);
      const existingCount = store.enrollments.filter((enrollment) => enrollment.tenantId === tenantId && enrollment.schoolClassId === destinationClassId && enrollment.academicYearId === destinationYear.id && (enrollment.status === 'ACTIVE' || enrollment.status === 'SUSPENDED')).length;
      if (destination && existingCount + incomingCount > destination.capacity) throw new Error(`The selected destination class does not have capacity for all ${incomingCount} selected student(s).`);
    }

    const enrollments: EnrollmentRecord[] = created.map((record) => ({
      id: record.toEnrollmentId,
      tenantId: record.tenantId,
      studentId: record.studentId,
      schoolClassId: record.destinationClassId,
      academicYearId: record.academicYearId,
      status: 'ACTIVE',
      enrolledAt: timestamp,
      createdAt: timestamp,
    }));
    store.enrollments = [...store.enrollments, ...enrollments];
    store.promotionRecords = [...store.promotionRecords, ...created];
    store.students = store.students.map((student) => {
      const promotion = created.find((record) => record.studentId === student.id);
      const enrollment = promotion && enrollments.find((record) => record.id === promotion.toEnrollmentId);
      return promotion && enrollment ? { ...student, currentClassId: enrollment.schoolClassId, enrollmentId: enrollment.id, updatedAt: timestamp } : student;
    });
    store.auditEvents = [...store.auditEvents, {
      id: `audit-${globalThis.crypto.randomUUID()}`,
      tenantId,
      userId: actor.id,
      action: 'CREATE',
      entityType: 'PROMOTION_BATCH',
      entityId: created[0]?.id,
      details: JSON.stringify({ count: created.length, decisions: created.map((record) => ({ studentId: record.studentId, decision: record.decision, destinationClassId: record.destinationClassId })), notes }),
      createdAt: timestamp,
    }];
    MockDatabase.saveStore(store);
    return created;
  }
}
