import { isMockMode } from '../config';
import { usersApi, UserCreateRequest } from '../../api/users';
import { UserService } from '../services/user-service';

export class UserAdapter {
  static getUsers() { return isMockMode ? Promise.resolve(UserService.list()) : usersApi.getUsers(); }
  static getUser(id: string | number) { return isMockMode ? Promise.resolve(UserService.get(id)).then((user) => {
    if (!user) throw new Error('User not found'); return user;
  }) : usersApi.getUser(id); }
  static createUser(data: UserCreateRequest) { return isMockMode ? Promise.resolve(UserService.create(data)) : usersApi.createUser(data); }
}
