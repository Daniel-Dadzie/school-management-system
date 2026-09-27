import { isMockMode } from '../config';
import { fetchSettings, updateSettings, SettingsRequest } from '../../api/settings';
import { SettingsService } from '../services/settings-service';

export class SettingsAdapter {
  static getSettings() {
    return isMockMode ? Promise.resolve(SettingsService.getSettings()) : fetchSettings();
  }

  static updateSettings(data: SettingsRequest) {
    return isMockMode ? Promise.resolve(SettingsService.updateSettings(data)) : updateSettings(data);
  }
}
