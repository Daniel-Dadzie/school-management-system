import { isMockMode } from '../config';
import { fetchSettings, updateSettings, SettingsRequest, ReportCardConfigRequest, ReportCardConfigResponse } from '../../api/settings';
import { SettingsService } from '../services/settings-service';

export class SettingsAdapter {
  static getSettings() {
    return isMockMode ? Promise.resolve(SettingsService.getSettings()) : fetchSettings();
  }

  static updateSettings(data: SettingsRequest) {
    return isMockMode ? Promise.resolve(SettingsService.updateSettings(data)) : updateSettings(data);
  }

  static getReportCardConfig(): Promise<ReportCardConfigResponse> {
    return isMockMode ? Promise.resolve(SettingsService.getReportCardConfig()) : Promise.resolve({} as any); // Real backend not implemented for this step
  }

  static updateReportCardConfig(data: ReportCardConfigRequest): Promise<ReportCardConfigResponse> {
    return isMockMode ? Promise.resolve(SettingsService.updateReportCardConfig(data)) : Promise.resolve({} as any); // Real backend not implemented for this step
  }
}
