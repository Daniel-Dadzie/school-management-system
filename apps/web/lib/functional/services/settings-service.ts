import { SettingsRepository } from '../repositories/settings-repository';
import { SettingsResponse, SettingsRequest } from '../../api/settings';
import { SettingsRecord } from '../types';
import { assertPermission, permissions } from '@/lib/authorization/permissions';

const toDto = (record: SettingsRecord): SettingsResponse => ({
  id: record.id,
  institutionName: record.institutionName,
  contactEmail: record.contactEmail,
  contactPhone: record.contactPhone,
  primaryColor: record.primaryColor,
  logoUrl: record.logoUrl,
  updatedAt: record.updatedAt,
});

export class SettingsService {
  static getSettings(): SettingsResponse {
    assertPermission(permissions.systemManage);
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
}
