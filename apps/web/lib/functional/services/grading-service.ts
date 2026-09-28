import { hasPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { AssessmentDomainError } from '../errors/assessment-domain-error';
import { AuditRepository } from '../repositories/audit-repository';
import { GradingRepository } from '../repositories/grading-repository';
import { MockDatabase } from '../storage/database';
import { GradeBandRecord, GradeEvaluation, GradeScaleRecord } from '../types';

export class GradingService {
  static bandsError(bands: GradeBandRecord[]): string | undefined {
    if (bands.length < 2) return 'A grading scale must contain at least two bands.';
    const grades = new Set<string>();
    const sorted = [...bands].sort((a, b) => a.minimumPercentage - b.minimumPercentage);
    for (const band of sorted) {
      const grade = band.grade.trim().toUpperCase();
      if (!grade || grades.has(grade)) return 'Grade labels must be unique and non-empty.';
      grades.add(grade);
      if (!Number.isFinite(band.minimumPercentage) || !Number.isFinite(band.maximumPercentage) ||
        band.minimumPercentage < 0 || band.maximumPercentage > 100 || band.minimumPercentage >= band.maximumPercentage) {
        return `The ${grade} band must have a valid range between 0 and 100.`;
      }
    }
    if (sorted[0].minimumPercentage !== 0 || sorted[sorted.length - 1].maximumPercentage !== 100) {
      return 'Grade bands must cover the full 0 to 100 percent range.';
    }
    for (let i = 1; i < sorted.length; i += 1) {
      if (Math.abs(sorted[i - 1].maximumPercentage - sorted[i].minimumPercentage) > 0.01) {
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
    if (input.isActive && tenantScales.some((scale) => scale.id !== input.id && scale.academicYearId === input.academicYearId && scale.isActive)) {
      throw new AssessmentDomainError('CONFLICT', 'Only one active grading scale is allowed per academic year.');
    }
    const prior = tenantScales.find((scale) => scale.id === input.id);
    const now = new Date().toISOString();
    const scale: GradeScaleRecord = {
      ...input,
      id: prior?.id ?? `grade-scale-${globalThis.crypto.randomUUID()}`,
      name,
      tenantId: actor?.tenantId ?? '',
      bands: input.bands.map((band) => ({ ...band, grade: band.grade.trim().toUpperCase(), remark: band.remark.trim() })),
      createdAt: prior?.createdAt ?? now,
      updatedAt: now,
    };
    GradingRepository.saveScale(scale);
    AuditRepository.create({ tenantId: scale.tenantId, userId: actor?.id ?? '', action: prior ? 'UPDATE' : 'CREATE', entityType: 'GRADE_SCALE', entityId: scale.id });
    return scale;
  }

  static activeScale(tenantId: string, academicYearId: string): GradeScaleRecord | undefined {
    return GradingRepository.scales().find((scale) => scale.tenantId === tenantId && scale.academicYearId === academicYearId && scale.isActive);
  }

  static evaluate(score: number, maximumScore: number, weightPercent: number, scale: GradeScaleRecord): GradeEvaluation {
    if (!Number.isFinite(score) || score < 0 || score > maximumScore || maximumScore <= 0) throw new AssessmentDomainError('INVALID', 'Score must be between zero and the assessment maximum.');
    const percentage = Math.round((score / maximumScore) * 10000) / 100;
    const band = scale.bands.find((candidate) => percentage >= candidate.minimumPercentage && (percentage <= candidate.maximumPercentage || candidate.maximumPercentage === 100));
    if (!band) throw new AssessmentDomainError('INVALID', 'The active grading scale does not cover this score.');
    return { percentage, grade: band.grade, gradePoint: band.gradePoint, remark: band.remark, weightedContribution: Math.round(percentage * weightPercent) / 100 };
  }
}
