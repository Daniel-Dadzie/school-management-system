import { LocalStorageAdapter } from './local-storage-adapter';
import { MockStore } from '../types';
import { defaultTenant, defaultUsers, defaultStudents, defaultClasses, defaultAuditLogs } from '../seed/seed-data';

const STORE_KEY = 'carepoint_mock_store';
const CURRENT_VERSION = 1;

export class MockDatabase {
  static getStore(): MockStore {
    const raw = LocalStorageAdapter.getItem(STORE_KEY);
    if (!raw) {
      return this.initializeStore();
    }
    try {
      const data = JSON.parse(raw) as MockStore;
      if (data.version !== CURRENT_VERSION) {
        return this.initializeStore();
      }
      return data;
    } catch {
      return this.initializeStore();
    }
  }

  static saveStore(store: MockStore): void {
    LocalStorageAdapter.setItem(STORE_KEY, JSON.stringify(store));
  }

  static initializeStore(): MockStore {
    const initialStore: MockStore = {
      version: CURRENT_VERSION,
      tenants: [defaultTenant],
      users: [...defaultUsers],
      students: [...defaultStudents],
      classes: [...defaultClasses],
      auditEvents: [...defaultAuditLogs],
    };
    this.saveStore(initialStore);
    return initialStore;
  }

  static getCollection<K extends keyof Omit<MockStore, 'version'>>(key: K): MockStore[K] {
    const store = this.getStore();
    return store[key];
  }

  static setCollection<K extends keyof Omit<MockStore, 'version'>>(key: K, data: MockStore[K]): void {
    const store = this.getStore();
    store[key] = data;
    this.saveStore(store);
  }
}
