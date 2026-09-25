import { User } from '../types';
import { MockDatabase } from '../storage/database';

export class UserRepository {
  static findAll(): User[] {
    return MockDatabase.get<User>('users');
  }

  static findById(id: string): User | undefined {
    return this.findAll().find(user => user.id === id);
  }

  static findByUsername(username: string): User | undefined {
    return this.findAll().find(user => user.username === username);
  }

  static save(user: User): User {
    const users = this.findAll();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    MockDatabase.set('users', users);
    return user;
  }
}
