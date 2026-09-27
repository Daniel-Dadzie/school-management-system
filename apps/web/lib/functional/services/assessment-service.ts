import { AcademicRepository } from '../repositories/academic-repository';
import { AssessmentRepository } from '../repositories/assessment-repository';
import { StudentRepository } from '../repositories/student-repository';
import { MockDatabase } from '../storage/database';
import { useAuthStore } from '@/stores/auth-store';
import { AssessmentDomainError } from '../errors/assessment-domain-error';
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
    if (!assessment) throw new AssessmentDomainError('NOT_FOUND', 'Assessment not found.');
    return assessment;
  }

  private static validateRelationships(input: Pick<AssessmentCreateRequest, 'termId' | 'classId' | 'subjectId'>): void {
    const term = MockDatabase.getStore().terms.find((record) => record.id === input.termId);
    const schoolClass = AcademicRepository.classes().find((record) => record.id === input.classId);
    const subject = AcademicRepository.subjects().find((record) => record.id === input.subjectId);

    if (!term || !schoolClass || !subject) {
      throw new AssessmentDomainError('INVALID', 'Choose an existing term, class, and subject.');
    }
    if (schoolClass.academicYearId !== term.academicYearId) {
      throw new AssessmentDomainError('INVALID', 'The selected class and term must belong to the same academic year.');
    }
    if (schoolClass.tenantId !== term.tenantId || subject.tenantId !== term.tenantId) {
      throw new AssessmentDomainError('INVALID', 'The selected term, class, and subject must belong to the same school.');
    }
  }

  private static validateCurrentFinal(input: Pick<AssessmentCreateRequest, 'termId' | 'classId' | 'subjectId' | 'isCurrentFinal'>, exceptId?: string): void {
    if (!input.isCurrentFinal) return;
    const conflict = AssessmentRepository.findAll().some((assessment) =>
      assessment.id !== exceptId &&
      assessment.status !== 'REJECTED' &&
      assessment.isCurrentFinal &&
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
    return AssessmentRepository.findAll()
      .filter((assessment) => this.teacherHasAssessmentAssignment(assessment))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static findById(id: string): AssessmentRecord | null {
    this.requirePermission(permissions.assessmentsView);
    const assessment = AssessmentRepository.findById(id);
    if (assessment) this.assertCanAccessAssessment(assessment);
    return assessment ?? null;
  }

  static create(input: AssessmentCreateRequest): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const title = input.title.trim();
    if (title.length < 2 || title.length > 120) {
      throw new AssessmentDomainError('INVALID', 'Assessment title must be between 2 and 120 characters.');
    }
    this.validateRelationships(input);
    this.validateCurrentFinal(input);

    const createdAt = timestamp();
    const assessment: AssessmentRecord = {
      ...input,
      title,
      id: createId('assessment'),
      tenantId: MockDatabase.getStore().tenants[0]?.id ?? 'tenant-1',
      status: 'DRAFT',
      createdAt,
      updatedAt: createdAt,
    };
    return AssessmentRepository.save(assessment);
  }

  static update(id: string, input: AssessmentUpdateRequest): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const existing = this.getRequiredAssessment(id);
    if (existing.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Rejected assessments cannot be edited.');
    }

    const updated: AssessmentRecord = {
      ...existing,
      title: input.title?.trim() ?? existing.title,
      termId: input.termId ?? existing.termId,
      classId: input.classId ?? existing.classId,
      subjectId: input.subjectId ?? existing.subjectId,
      isCurrentFinal: input.isCurrentFinal ?? existing.isCurrentFinal,
    };
    if (updated.title.length < 2 || updated.title.length > 120) {
      throw new AssessmentDomainError('INVALID', 'Assessment title must be between 2 and 120 characters.');
    }
    this.validateRelationships(updated);
    this.validateCurrentFinal(updated, id);
    const saved = { ...updated, updatedAt: timestamp() };
    return AssessmentRepository.save(saved);
  }

  static reject(id: string, reason?: string): AssessmentRecord {
    this.requirePermission(permissions.assessmentsManage);
    const existing = this.getRequiredAssessment(id);
    if (existing.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Rejected assessments are already terminal.');
    }
    const now = timestamp();
    return AssessmentRepository.save({
      ...existing,
      status: 'REJECTED',
      isCurrentFinal: false,
      rejectionReason: reason?.trim() || undefined,
      rejectedAt: now,
      updatedAt: now,
    });
  }

  static findResults(assessmentId: string): AssessmentResultRecord[] {
    this.requirePermission(permissions.assessmentResultsView);
    const assessment = this.getRequiredAssessment(assessmentId);
    this.assertCanAccessAssessment(assessment);
    return AssessmentRepository.findResults(assessmentId);
  }

  static saveResult(assessmentId: string, input: AssessmentResultInput): AssessmentResultRecord {
    this.requirePermission(permissions.resultsManage);
    const assessment = this.getRequiredAssessment(assessmentId);
    if (!this.teacherHasAssessmentAssignment(assessment)) {
      throw new AssessmentDomainError('FORBIDDEN', 'This assessment is outside your active teaching assignments.');
    }
    if (assessment.status === 'REJECTED') {
      throw new AssessmentDomainError('INVALID', 'Results cannot be changed for a rejected assessment.');
    }
    if (!Number.isFinite(input.score) || input.score < 0) {
      throw new AssessmentDomainError('INVALID', 'Score must be a non-negative number.');
    }
    if (input.outcome !== 'PASSED' && input.outcome !== 'FAILED') {
      throw new AssessmentDomainError('INVALID', 'Choose a valid result outcome.');
    }

    const enrollment = AcademicRepository.enrollments().find((record) => record.id === input.enrollmentId);
    const student = StudentRepository.findById(input.studentId);
    const term = MockDatabase.getStore().terms.find((record) => record.id === assessment.termId);
    if (!enrollment || !student || enrollment.studentId !== student.id ||
      enrollment.status !== 'ACTIVE' ||
      enrollment.schoolClassId !== assessment.classId ||
      enrollment.academicYearId !== term?.academicYearId ||
      enrollment.tenantId !== assessment.tenantId || student.tenantId !== assessment.tenantId ||
      student.status !== 'ACTIVE') {
      throw new AssessmentDomainError('INVALID', 'Choose an enrolled student from this assessment class.');
    }

    const existing = AssessmentRepository.findResults(assessmentId).find(
      (result) => result.enrollmentId === enrollment.id,
    );
    const now = timestamp();
    return AssessmentRepository.saveResult({
      id: existing?.id ?? createId('assessment-result'),
      tenantId: assessment.tenantId,
      assessmentId,
      enrollmentId: enrollment.id,
      studentId: student.id,
      score: input.score,
      outcome: input.outcome,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  }
}
