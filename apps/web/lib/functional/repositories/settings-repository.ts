import { MockDatabase } from '../storage/database';
import { SettingsRecord, ReportCardConfigurationRecord } from '../types';

export class SettingsRepository {
  static getSettings(): SettingsRecord {
    return MockDatabase.getStore().settings[0];
  }

  static updateSettings(data: Partial<SettingsRecord>): SettingsRecord {
    const store = MockDatabase.getStore();
    const current = store.settings[0];
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    store.settings[0] = updated;
    MockDatabase.saveStore(store);
    return updated;
  }

  static getReportCardConfig(): ReportCardConfigurationRecord {
    const store = MockDatabase.getStore();
    if (!store.reportCardConfigurations || store.reportCardConfigurations.length === 0) {
      // Default fallback if missing
      const defaultConfig: ReportCardConfigurationRecord = {
        id: 'cfg-1',
        tenantId: store.settings[0]?.tenantId || 'tenant-1',
        showLogo: true,
        showWatermark: true,
        showSchoolAddress: true,
        showContactInformation: true,
        showMotto: true,
        showStudentPhoto: true,
        showDateOfBirth: true,
        showGender: true,
        showStudentId: true,
        showClass: true,
        showAcademicYear: true,
        showTerm: true,
        showTermDates: true,
        showReportIssueDate: true,
        showAssessmentBreakdown: true,
        showSubjectTotals: true,
        showGrades: true,
        showGradePoints: true,
        showRemarks: true,
        showAttendance: true,
        showPosition: false,
        showOverallAverage: true,
        showClassTeacherComment: true,
        showHeadTeacherComment: true,
        showPromotionStatus: true,
        showSignatureAreas: true,
        footerText: 'This is a computer-generated document. No signature is required.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      store.reportCardConfigurations = [defaultConfig];
      MockDatabase.saveStore(store);
    } else if (store.reportCardConfigurations[0].showWatermark === undefined) {
      store.reportCardConfigurations[0].showWatermark = true;
      MockDatabase.saveStore(store);
    }
    return store.reportCardConfigurations[0];
  }

  static updateReportCardConfig(data: Partial<ReportCardConfigurationRecord>): ReportCardConfigurationRecord {
    const store = MockDatabase.getStore();
    const current = this.getReportCardConfig();
    const updated = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    store.reportCardConfigurations[0] = updated;
    MockDatabase.saveStore(store);
    return updated;
  }
}
