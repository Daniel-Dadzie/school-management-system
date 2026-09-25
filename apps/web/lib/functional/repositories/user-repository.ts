import { UserRecord } from '../types';
import { MockDatabase } from '../storage/database';

export class UserRepository {
  static findAll(): UserRecord[] {
    return MockDatabase.getCollection('users');
  }

  static findById(id: string): UserRecord | undefined {
    return this.findAll().find(user => user.id === id);
  }

  static findByUsername(username: string): UserRecord | undefined {
    return this.findAll().find(user => user.username === username);
  }

  static save(user: UserRecord): UserRecord {
    const users = this.findAll();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    MockDatabase.setCollection('users', users);
    return user;
  }
}
