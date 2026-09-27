import { MockDatabase } from '../storage/database';
import { SettingsRecord } from '../types';

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
}
