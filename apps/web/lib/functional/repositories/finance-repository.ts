import { MockDatabase } from '../storage/database';

export class FinanceRepository {
  static read() { return MockDatabase.getStore(); }
  static save(store: ReturnType<typeof MockDatabase.getStore>) { MockDatabase.saveStore(store); }
}
