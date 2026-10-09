import { AcademicRepository } from '../repositories/academic-repository';
import { AssessmentRepository } from '../repositories/assessment-repository';
import { StudentRepository } from '../repositories/student-repository';
import { MockDatabase } from '../storage/database';
import { useAuthStore } from '@/stores/auth-store';
import { AssessmentDomainError } from '../errors/assessment-domain-error';
import { AuditRepository } from '../repositories/audit-repository';
import { GradingService } from './grading-service';
import { hasPermission, permissions } from '@/lib/authorization/permissions';
import {
  AssessmentCreateRequest,
  AssessmentRecord,
  AssessmentResultInput,
  AssessmentResultRecord,
  AssessmentUpdateRequest,
} from '../types';

const createId = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
const timestamp = () => new Date().toISOString();

export class AssessmentService {
  private static requirePermission(permission: (typeof permissions)[keyof typeof permissions]): void {
    const role = useAuthStore.getState().user?.role;
    if (!hasPermission(role, permission)) {
      throw new AssessmentDomainError('FORBIDDEN', 'You do not have access to this assessment operation.');
    }
  }

  private static teacherHasAssessmentAssignment(assessment: AssessmentRecord): boolean {
    const user = useAuthStore.getState().user;
    if (user?.role !== 'TEACHER') return true;
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    return MockDatabase.getStore().teacherAssignments.some((assignment) =>
      assignment.teacherId === user.id && assignment.tenantId === user.tenantId && assignment.status === 'ACTIVE' &&
      assignment.schoolClassId === assessment.classId && assignment.subjectId === assessment.subjectId &&
      assignment.termId === assessment.termId && assignment.academicYearId === term?.academicYearId,
    );
  }

  private static assertCanAccessAssessment(assessment: AssessmentRecord): void {
    this.requirePermission(permissions.assessmentResultsView);
    if (!this.teacherHasAssessmentAssignment(assessment)) {
      throw new AssessmentDomainError('FORBIDDEN', 'This assessment is outside your active teaching assignments.');
    }
  }

  private static getRequiredAssessment(id: string): AssessmentRecord {
    const assessment = AssessmentRepository.findById(id);
    if (!assessment || assessment.tenantId !== useAuthStore.getState().user?.tenantId) throw new AssessmentDomainError('NOT_FOUND', 'Assessment not found.');
    return assessment;
  }

  private static validateRelationships(input: { termId: string, classId: string, subjectId: string }): void {
    const term = MockDatabase.getStore().terms.find((record) => record.id === input.termId);
    const schoolClass = AcademicRepository.classes().find((record) => record.id === input.classId);
    const subject = AcademicRepository.subjects().find((record) => record.id === input.subjectId);
    const tenantId = useAuthStore.getState().user?.tenantId;

    if (!term || !schoolClass || !subject) {
      throw new AssessmentDomainError('INVALID', 'Choose an existing term, class, and subject.');
    }
    if (schoolClass.academicYearId !== term.academicYearId) {
      throw new AssessmentDomainError('INVALID', 'The selected class and term must belong to the same academic year.');
    }
    if (schoolClass.tenantId !== term.tenantId || subject.tenantId !== term.tenantId || term.tenantId !== tenantId) {
      throw new AssessmentDomainError('INVALID', 'The selected term, class, and subject must belong to the same school.');
    }
  }

  private static validateAssessmentFields(input: Pick<AssessmentCreateRequest, 'categoryId' | 'assessmentDate' | 'maximumScore' | 'weightPercent'> & { termId: string }): void {
    const actor = useAuthStore.getState().user;
    const category = MockDatabase.getStore().assessmentCategories.find((record) => record.id === input.categoryId && record.tenantId === actor?.tenantId && record.isActive);
    if (!category) throw new AssessmentDomainError('INVALID', 'Choose an active assessment category.');
    const term = MockDatabase.getStore().terms.find((record) => record.id === input.termId);
    const parsedDate = Date.parse(`${input.assessmentDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.assessmentDate) || !Number.isFinite(parsedDate) || !term || input.assessmentDate < term.startDate.slice(0, 10) || input.assessmentDate > term.endDate.slice(0, 10)) {
      throw new AssessmentDomainError('INVALID', 'Assessment date must fall within the selected term.');
    }
    if (!Number.isFinite(input.maximumScore) || input.maximumScore <= 0 || !Number.isFinite(input.weightPercent) || input.weightPercent <= 0 || input.weightPercent > 100) {
      throw new AssessmentDomainError('INVALID', 'Maximum score and weight must be greater than zero; weight cannot exceed 100%.');
    }
  }

  private static validateCurrentFinal(input: { termId: string, classId: string, subjectId: string, isCurrentFinal: boolean }, exceptId?: string): void {
    if (!input.isCurrentFinal) return;
    const conflict = AssessmentRepository.findAll().some((assessment) =>
      assessment.id !== exceptId &&
      assessment.status !== 'REJECTED' &&
      assessment.isCurrentFinal &&
      assessment.tenantId === useAuthStore.getState().user?.tenantId &&
      assessment.termId === input.termId &&
      assessment.classId === input.classId &&
      assessment.subjectId === input.subjectId,
    );
    if (conflict) {
      throw new AssessmentDomainError('CONFLICT', 'Another current/final assessment already exists for this term, class, and subject.');
    }
  }

  static findAll(): AssessmentRecord[] {
    this.requirePermission(permissions.assessmentsView);
    const tenantId = useAuthStore.getState().user?.tenantId;
    return AssessmentRepository.findAll().filter((assessment) => assessment.tenantId === tenantId)
      .filter((assessment) => this.teacherHasAssessmentAssignment(assessment))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static findById(id: string): AssessmentRecord | null {
    this.requirePermission(permissions.assessmentsView);
    const assessment = AssessmentRepository.findById(id);
    if (assessment) {
      if (assessment.tenantId !== useAuthStore.getState().user?.tenantId) throw new AssessmentDomainError('NOT_FOUND', 'Assessment not found.');
      this.assertCanAccessAssessment(assessment);
    }
    return assessment ?? null;
  }

  static create(input: AssessmentCreateRequest): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const title = input.title.trim();
    if (title.length < 2 || title.length > 120) {
      throw new AssessmentDomainError('INVALID', 'Assessment title must be between 2 and 120 characters.');
    }
    const assignment = MockDatabase.getStore().teacherAssignments.find((a) => a.id === input.teacherAssignmentId);
    if (!assignment) throw new AssessmentDomainError('INVALID', 'Teacher assignment not found.');
    const context = { termId: assignment.termId, classId: assignment.schoolClassId, subjectId: assignment.subjectId, isCurrentFinal: input.isCurrentFinal };
    this.validateRelationships(context);
    this.validateAssessmentFields({ ...input, termId: context.termId });
    const actor = useAuthStore.getState().user;
    const duplicate = AssessmentRepository.findAll().some((record) => record.tenantId === actor?.tenantId && record.status !== 'REJECTED' && record.termId === context.termId && record.classId === context.classId && record.subjectId === context.subjectId && record.title.trim().toLowerCase() === title.toLowerCase());
    if (duplicate) throw new AssessmentDomainError('CONFLICT', 'An assessment with this title already exists in the selected class, subject, and term.');
    this.validateCurrentFinal(context);

    const createdAt = timestamp();
    const assessment: AssessmentRecord = {
      ...input,
      ...context,
      title,
      id: createId('assessment'),
      tenantId: actor?.tenantId ?? '',
      createdBy: actor?.id,
      status: 'DRAFT',
      createdAt,
      updatedAt: createdAt,
    };
    const saved = AssessmentRepository.save(assessment);
    AuditRepository.create({ tenantId: saved.tenantId, userId: actor?.id ?? '', action: 'CREATE', entityType: 'ASSESSMENT', entityId: saved.id });
    return saved;
  }

  static update(id: string, input: AssessmentUpdateRequest): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const existing = this.getRequiredAssessment(id);
    if (AssessmentRepository.findResults(id).some((result) => result.status === 'FINALIZED')) throw new AssessmentDomainError('INVALID', 'Assessments with finalized results cannot be edited.');
    if (existing.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Rejected assessments cannot be edited.');
    }

    const updated: AssessmentRecord = {
      ...existing,
      title: input.title?.trim() ?? existing.title,
      isCurrentFinal: input.isCurrentFinal ?? existing.isCurrentFinal,
      categoryId: input.categoryId ?? existing.categoryId,
      description: input.description ?? existing.description,
      assessmentDate: input.assessmentDate ?? existing.assessmentDate,
      maximumScore: input.maximumScore ?? existing.maximumScore,
      weightPercent: input.weightPercent ?? existing.weightPercent,
    };
    if (input.teacherAssignmentId) {
       const assignment = MockDatabase.getStore().teacherAssignments.find((a) => a.id === input.teacherAssignmentId);
       if (assignment) {
         updated.teacherAssignmentId = assignment.id;
         updated.termId = assignment.termId;
         updated.classId = assignment.schoolClassId;
         updated.subjectId = assignment.subjectId;
       }
    }
    if (updated.title.length < 2 || updated.title.length > 120) {
      throw new AssessmentDomainError('INVALID', 'Assessment title must be between 2 and 120 characters.');
    }
    this.validateRelationships(updated);
    this.validateAssessmentFields(updated as unknown as Pick<AssessmentCreateRequest, 'categoryId' | 'assessmentDate' | 'maximumScore' | 'weightPercent'> & {termId: string});
    const duplicate = AssessmentRepository.findAll().some((record) => record.id !== id && record.tenantId === existing.tenantId && record.status !== 'REJECTED' && record.termId === updated.termId && record.classId === updated.classId && record.subjectId === updated.subjectId && record.title.trim().toLowerCase() === updated.title.trim().toLowerCase());
    if (duplicate) throw new AssessmentDomainError('CONFLICT', 'An assessment with this title already exists in the selected class, subject, and term.');
    this.validateCurrentFinal(updated, id);
    const saved = { ...updated, updatedAt: timestamp() };
    const result = AssessmentRepository.save(saved);
    const actor = useAuthStore.getState().user;
    AuditRepository.create({ tenantId: existing.tenantId, userId: actor?.id ?? '', action: 'UPDATE', entityType: 'ASSESSMENT', entityId: id });
    return result;
  }

  static reject(id: string, reason?: string): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const existing = this.getRequiredAssessment(id);
    if (AssessmentRepository.findResults(id).some((result) => result.status === 'FINALIZED')) throw new AssessmentDomainError('INVALID', 'Assessments with finalized results cannot be rejected.');
    if (existing.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Rejected assessments are already terminal.');
    }
    const now = timestamp();
    const result = AssessmentRepository.save({
      ...existing,
      status: 'REJECTED',
      isCurrentFinal: false,
      rejectionReason: reason?.trim() || undefined,
      rejectedAt: now,
      updatedAt: now,
    });
    const actor = useAuthStore.getState().user;
    AuditRepository.create({ tenantId: existing.tenantId, userId: actor?.id ?? '', action: 'UPDATE', entityType: 'ASSESSMENT_REJECTION', entityId: id });
    return result;
  }

  static findResults(assessmentId: string): AssessmentResultRecord[] {
    this.requirePermission(permissions.assessmentResultsView);
    const assessment = this.getRequiredAssessment(assessmentId);
    this.assertCanAccessAssessment(assessment);
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    const scale = term && GradingService.activeScale(assessment.tenantId, term.academicYearId);
    return AssessmentRepository.findResults(assessmentId).filter((result) => result.tenantId === assessment.tenantId).map((result) => {
      const resultScale = result.gradingScaleId ? GradingService.findScale(result.gradingScaleId) : scale;
      if (!resultScale) return result;
      return { ...result, ...GradingService.evaluate(result.score, assessment.maximumScore ?? 100, assessment.weightPercent ?? 0, resultScale) };
    });
  }

  static previewResults(assessmentId: string, inputs: AssessmentResultInput[]) {
    this.requirePermission(permissions.resultsManage);
    const assessment = this.getRequiredAssessment(assessmentId);
    if (assessment.tenantId !== useAuthStore.getState().user?.tenantId || !this.teacherHasAssessmentAssignment(assessment)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot preview scores for this assessment.');
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    const scale = term && GradingService.activeScale(assessment.tenantId, term.academicYearId);
    if (!scale) return [];
    return inputs.filter((input) => input.score !== null && input.score !== undefined).map((input) => ({ enrollmentId: input.enrollmentId, ...GradingService.evaluate(input.score!, assessment.maximumScore ?? 100, assessment.weightPercent ?? 0, scale) }));
  }

  static saveResult(assessmentId: string, input: AssessmentResultInput): AssessmentResultRecord {
    return this.saveResults(assessmentId, [input])[0];
  }

  static saveResults(assessmentId: string, inputs: AssessmentResultInput[]): AssessmentResultRecord[] {
    this.requirePermission(permissions.resultsManage);
    const assessment = this.getRequiredAssessment(assessmentId);
    if (!this.teacherHasAssessmentAssignment(assessment)) {
      throw new AssessmentDomainError('FORBIDDEN', 'This assessment is outside your active teaching assignments.');
    }
    if (assessment.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Results cannot be changed for a rejected assessment.');
    }
    if (assessment.tenantId !== useAuthStore.getState().user?.tenantId) throw new AssessmentDomainError('NOT_FOUND', 'Assessment not found.');
    const maximumScore = assessment.maximumScore ?? 100;
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    const activeInputs = inputs.filter((input) => input.score !== null && input.score !== undefined);
    if (!activeInputs.length) throw new AssessmentDomainError('INVALID', 'Enter at least one score before saving.');
    if (new Set(activeInputs.map((input) => input.enrollmentId)).size !== activeInputs.length) throw new AssessmentDomainError('INVALID', 'A student can only appear once in a score submission.');
    if (new Set(activeInputs.map((input) => input.studentId)).size !== activeInputs.length) throw new AssessmentDomainError('INVALID', 'A student can only appear once in a score submission.');
    const records = activeInputs.map((input) => {
      if (!Number.isFinite(input.score) || input.score! < 0 || input.score! > maximumScore) throw new AssessmentDomainError('INVALID', `Score must be between 0 and ${maximumScore}.`);
      const enrollment = AcademicRepository.enrollments().find((record) => record.id === input.enrollmentId);
      const student = StudentRepository.findById(input.studentId);
      if (!enrollment || !student || enrollment.studentId !== student.id || enrollment.status !== 'ACTIVE' || enrollment.schoolClassId !== assessment.classId || enrollment.academicYearId !== term?.academicYearId || enrollment.tenantId !== assessment.tenantId || student.tenantId !== assessment.tenantId || student.status !== 'ACTIVE') throw new AssessmentDomainError('INVALID', 'Choose an enrolled student from this assessment class.');
      const existing = AssessmentRepository.findResults(assessmentId).find((result) => result.enrollmentId === enrollment.id || result.studentId === student.id);
      if (existing?.status === 'FINALIZED') throw new AssessmentDomainError('INVALID', 'Finalized results are locked.');
      const now = timestamp();
      const actor = useAuthStore.getState().user;
      return { id: existing?.id ?? createId('assessment-result'), tenantId: assessment.tenantId, assessmentId, enrollmentId: enrollment.id, studentId: student.id, score: input.score!, enteredBy: actor?.id, status: 'ENTERED' as const, createdAt: existing?.createdAt ?? now, updatedAt: now };
    });
    const actor = useAuthStore.getState().user;
    AssessmentRepository.saveResults(records);
    AuditRepository.create({ tenantId: assessment.tenantId, userId: actor?.id ?? '', action: 'UPDATE', entityType: 'ASSESSMENT_RESULTS_SAVED', entityId: assessment.id, details: JSON.stringify({ count: records.length }) });
    return records;
  }

  static finalizeResults(assessmentId: string): AssessmentResultRecord[] {
    this.requirePermission(permissions.resultsManage);
    const assessment = this.getRequiredAssessment(assessmentId);
    if (assessment.status === 'REJECTED') throw new AssessmentDomainError('INVALID', 'Rejected assessments cannot be finalized.');
    if (assessment.tenantId !== useAuthStore.getState().user?.tenantId || !this.teacherHasAssessmentAssignment(assessment)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot finalize this assessment.');
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    const scale = term && GradingService.activeScale(assessment.tenantId, term.academicYearId);
    if (!scale) throw new AssessmentDomainError('INVALID', 'Configure an active grading scale before finalizing results.');
    const roster = AcademicRepository.enrollments().filter((enrollment) => enrollment.tenantId === assessment.tenantId && enrollment.schoolClassId === assessment.classId && enrollment.academicYearId === term?.academicYearId && enrollment.status === 'ACTIVE');
    const results = AssessmentRepository.findResults(assessmentId);
    if (!roster.length || roster.some((enrollment) => !results.some((result) => result.enrollmentId === enrollment.id))) throw new AssessmentDomainError('INVALID', 'Enter a result for every active student before finalizing.');
    const siblings = AssessmentRepository.findAll().filter((item) => item.tenantId === assessment.tenantId && item.termId === assessment.termId && item.classId === assessment.classId && item.subjectId === assessment.subjectId && item.status !== 'REJECTED');
    if (Math.abs(siblings.reduce((sum, item) => sum + (item.weightPercent ?? 0), 0) - 100) > 0.01) throw new AssessmentDomainError('INVALID', 'Assessment weights for this subject and term must total exactly 100% before finalization.');
    const now = timestamp();
    const finalized = results.map((result) => ({ ...result, status: 'FINALIZED' as const, gradingScaleId: scale.id, finalizedAt: now, updatedAt: now }));
    AssessmentRepository.saveResults(finalized);
    const actor = useAuthStore.getState().user;
    AuditRepository.create({ tenantId: assessment.tenantId, userId: actor?.id ?? '', action: 'UPDATE', entityType: 'ASSESSMENT_RESULTS_FINALIZED', entityId: assessment.id });
    return finalized;
  }
}
