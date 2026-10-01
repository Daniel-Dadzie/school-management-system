import { SettingsRepository } from '../repositories/settings-repository';
import { SettingsResponse, SettingsRequest, ReportCardConfigResponse, ReportCardConfigRequest } from '../../api/settings';
import { SettingsRecord, ReportCardConfigurationRecord } from '../types';
import { assertPermission, hasPermission, permissions, AuthorizationError } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';

const toDto = (record: SettingsRecord): SettingsResponse => ({
  id: record.id,
  institutionName: record.institutionName,
  contactEmail: record.contactEmail,
  contactPhone: record.contactPhone,
  primaryColor: record.primaryColor,
  logoUrl: record.logoUrl,
  updatedAt: record.updatedAt,
});

const toReportCardConfigDto = (record: ReportCardConfigurationRecord): ReportCardConfigResponse => ({
  id: record.id,
  showLogo: record.showLogo,
  showSchoolAddress: record.showSchoolAddress,
  showContactInformation: record.showContactInformation,
  showMotto: record.showMotto,
  showStudentPhoto: record.showStudentPhoto,
  showDateOfBirth: record.showDateOfBirth,
  showGender: record.showGender,
  showStudentId: record.showStudentId,
  showClass: record.showClass,
  showAcademicYear: record.showAcademicYear,
  showTerm: record.showTerm,
  showTermDates: record.showTermDates,
  showReportIssueDate: record.showReportIssueDate,
  showAssessmentBreakdown: record.showAssessmentBreakdown,
  showSubjectTotals: record.showSubjectTotals,
  showGrades: record.showGrades,
  showGradePoints: record.showGradePoints,
  showRemarks: record.showRemarks,
  showAttendance: record.showAttendance,
  showPosition: record.showPosition,
  showOverallAverage: record.showOverallAverage,
  showClassTeacherComment: record.showClassTeacherComment,
  showHeadTeacherComment: record.showHeadTeacherComment,
  showPromotionStatus: record.showPromotionStatus,
  showSignatureAreas: record.showSignatureAreas,
  footerText: record.footerText,
});

export class SettingsService {
  private static assertReadableSettings(): void {
    const role = useAuthStore.getState().user?.role;
    if (!hasPermission(role, permissions.systemManage) && !hasPermission(role, permissions.resultsView)) {
      throw new AuthorizationError();
    }
  }

  static getSettings(): SettingsResponse {
    SettingsService.assertReadableSettings();
    const record = SettingsRepository.getSettings();
    return toDto(record);
  }

  static updateSettings(data: SettingsRequest): SettingsResponse {
    assertPermission(permissions.systemManage);
    const record = SettingsRepository.updateSettings({
      institutionName: data.institutionName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      primaryColor: data.primaryColor,
      logoUrl: data.logoUrl,
    });
    return toDto(record);
  }

  static getReportCardConfig(): ReportCardConfigResponse {
    SettingsService.assertReadableSettings();
    const record = SettingsRepository.getReportCardConfig();
    return toReportCardConfigDto(record);
  }

  static updateReportCardConfig(data: ReportCardConfigRequest): ReportCardConfigResponse {
    assertPermission(permissions.systemManage);
    const record = SettingsRepository.updateReportCardConfig(data);
    return toReportCardConfigDto(record);
  }
}
