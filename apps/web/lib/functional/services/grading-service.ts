import { hasPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { AssessmentDomainError } from '../errors/assessment-domain-error';
import { AuditRepository } from '../repositories/audit-repository';
import { GradingRepository } from '../repositories/grading-repository';
import { MockDatabase } from '../storage/database';
import { AssessmentCategoryRecord, GradeBandRecord, GradeEvaluation, GradeScaleRecord } from '../types';

export class GradingService {
  static categories(): AssessmentCategoryRecord[] {
    const actor = useAuthStore.getState().user;
    if (!hasPermission(actor?.role, permissions.academicsView)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot view assessment categories.');
    return GradingRepository.categories().filter((category) => category.tenantId === actor?.tenantId);
  }

  static scales(): GradeScaleRecord[] {
    const actor = useAuthStore.getState().user;
    if (!hasPermission(actor?.role, permissions.academicsView) && !hasPermission(actor?.role, permissions.resultsView)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot view grading scales.');
    return GradingRepository.scales().filter((scale) => scale.tenantId === actor?.tenantId);
  }

  static createCategory(nameInput: string): AssessmentCategoryRecord {
    const actor = useAuthStore.getState().user;
    if (!hasPermission(actor?.role, permissions.academicsManage)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot configure assessment categories.');
    const name = nameInput.trim();
    if (name.length < 2 || name.length > 60) throw new AssessmentDomainError('INVALID', 'Category name must be between 2 and 60 characters.');
    if (GradingRepository.categories().some((category) => category.tenantId === actor?.tenantId && category.name.toLowerCase() === name.toLowerCase())) throw new AssessmentDomainError('CONFLICT', 'That assessment category already exists.');
    const now = new Date().toISOString();
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32);
    if (GradingRepository.categories().some((category) => category.tenantId === actor?.tenantId && category.code === code)) throw new AssessmentDomainError('CONFLICT', 'That category code is already in use.');
    const category = GradingRepository.saveCategory({ id: `category-${globalThis.crypto.randomUUID()}`, tenantId: actor?.tenantId ?? '', name, code, isActive: true, createdAt: now });
    AuditRepository.create({ tenantId: category.tenantId, userId: actor?.id ?? '', action: 'CREATE', entityType: 'ASSESSMENT_CATEGORY', entityId: category.id });
    return category;
  }

  static bandsError(bands: GradeBandRecord[]): string | undefined {
    if (bands.length < 2) return 'A grading scale must contain at least two bands.';
    const grades = new Set<string>();
    const orders = new Set<number>();
    const sorted = [...bands].sort((a, b) => a.minimumPercentage - b.minimumPercentage);
    for (const band of sorted) {
      const grade = band.grade.trim().toUpperCase();
      if (!grade || grades.has(grade)) return 'Grade labels must be unique and non-empty.';
      grades.add(grade);
      if (!band.remark.trim() || !Number.isInteger(band.sortOrder) || orders.has(band.sortOrder)) return 'Each grade band needs a remark and unique ordering.';
      orders.add(band.sortOrder);
      if (band.gradePoint !== undefined && (!Number.isFinite(band.gradePoint) || band.gradePoint < 0)) return `The ${grade} grade point must be zero or greater.`;
      if (!Number.isFinite(band.minimumPercentage) || !Number.isFinite(band.maximumPercentage) ||
        band.minimumPercentage < 0 || band.maximumPercentage > 100 || band.minimumPercentage >= band.maximumPercentage ||
        Math.round(band.minimumPercentage * 100) / 100 !== band.minimumPercentage || Math.round(band.maximumPercentage * 100) / 100 !== band.maximumPercentage) {
        return `The ${grade} band must have a valid range between 0 and 100.`;
      }
    }
    if (sorted[0].minimumPercentage !== 0 || sorted[sorted.length - 1].maximumPercentage !== 100) {
      return 'Grade bands must cover the full 0 to 100 percent range.';
    }
    for (let i = 1; i < sorted.length; i += 1) {
      if (Math.round((sorted[i].minimumPercentage - sorted[i - 1].maximumPercentage) * 100) !== 1) {
        return 'Grade bands cannot overlap or leave gaps.';
      }
    }
    return undefined;
  }

  static saveScale(input: Omit<GradeScaleRecord, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> & { id?: string }): GradeScaleRecord {
    const actor = useAuthStore.getState().user;
    if (!hasPermission(actor?.role, permissions.academicsManage)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot configure grading scales.');
    const academicYear = MockDatabase.getStore().academicYears.find((year) => year.id === input.academicYearId && year.tenantId === actor?.tenantId);
    if (!academicYear) throw new AssessmentDomainError('INVALID', 'Choose an academic year in your school.');
    const name = input.name.trim();
    if (name.length < 2 || name.length > 100) throw new AssessmentDomainError('INVALID', 'Scale name must be between 2 and 100 characters.');
    const bandsError = this.bandsError(input.bands);
    if (bandsError) throw new AssessmentDomainError('INVALID', bandsError);
    const tenantScales = GradingRepository.scales().filter((scale) => scale.tenantId === actor?.tenantId);
    const prior = tenantScales.find((scale) => scale.id === input.id);
    const isReferenced = Boolean(prior && MockDatabase.getStore().assessmentResults.some((result) => {
      const assessment = MockDatabase.getStore().assessments.find((item) => item.id === result.assessmentId);
      const term = assessment && MockDatabase.getStore().terms.find((item) => item.id === assessment.termId);
      return result.status === 'FINALIZED' && (result.gradingScaleId === prior.id || (!result.gradingScaleId && term?.academicYearId === prior.academicYearId));
    }));
    if (input.isActive && tenantScales.some((scale) => scale.id !== prior?.id && scale.academicYearId === input.academicYearId && scale.isActive)) throw new AssessmentDomainError('CONFLICT', 'Only one active grading scale is allowed per academic year.');
    const now = new Date().toISOString();
    if (prior && isReferenced) GradingRepository.saveScale({ ...prior, isActive: false, updatedAt: now });
    const scale: GradeScaleRecord = {
      ...input,
      id: prior && !isReferenced ? prior.id : `grade-scale-${globalThis.crypto.randomUUID()}`,
      name,
      tenantId: actor?.tenantId ?? '',
      bands: input.bands.map((band) => ({ ...band, id: isReferenced ? `grade-band-${globalThis.crypto.randomUUID()}` : band.id, grade: band.grade.trim().toUpperCase(), remark: band.remark.trim() })),
      createdAt: prior && !isReferenced ? prior.createdAt : now,
      updatedAt: now,
    };
    GradingRepository.saveScale(scale);
    if (prior && isReferenced) AuditRepository.create({ tenantId: prior.tenantId, userId: actor?.id ?? '', action: 'UPDATE', entityType: 'GRADE_SCALE_SUPERSEDED', entityId: prior.id, details: JSON.stringify({ replacedBy: scale.id }) });
    AuditRepository.create({ tenantId: scale.tenantId, userId: actor?.id ?? '', action: isReferenced ? 'CREATE' : prior ? 'UPDATE' : 'CREATE', entityType: isReferenced ? 'GRADE_SCALE_VERSION' : 'GRADE_SCALE', entityId: scale.id });
    return scale;
  }

  static activeScale(tenantId: string, academicYearId: string): GradeScaleRecord | undefined {
    return GradingRepository.scales().find((scale) => scale.tenantId === tenantId && scale.academicYearId === academicYearId && scale.isActive);
  }

  static findScale(id: string): GradeScaleRecord | undefined {
    const actor = useAuthStore.getState().user;
    const scale = GradingRepository.findScale(id);
    return scale?.tenantId === actor?.tenantId ? scale : undefined;
  }

  static evaluate(score: number, maximumScore: number, weightPercent: number, scale: GradeScaleRecord): GradeEvaluation {
    if (!Number.isFinite(score) || score < 0 || score > maximumScore || maximumScore <= 0) throw new AssessmentDomainError('INVALID', 'Score must be between zero and the assessment maximum.');
    const percentage = Math.round((score / maximumScore) * 10000) / 100;
    const band = scale.bands.find((candidate) => percentage >= candidate.minimumPercentage && (percentage <= candidate.maximumPercentage || candidate.maximumPercentage === 100));
    if (!band) throw new AssessmentDomainError('INVALID', 'The active grading scale does not cover this score.');
    return { percentage, grade: band.grade, gradePoint: band.gradePoint, remark: band.remark, weightedContribution: Math.round(percentage * weightPercent) / 100 };
  }
}
