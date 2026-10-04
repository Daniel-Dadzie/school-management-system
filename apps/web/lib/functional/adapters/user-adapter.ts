import { isMockMode } from '../config';
import { usersApi, UserCreateRequest, UserUpdateRequest } from '../../api/users';
import { UserService } from '../services/user-service';

export class UserAdapter {
  static getActivity(id: string) { return isMockMode ? Promise.resolve(UserService.activity(id)) : Promise.reject(new Error('User activity API is not available in API mode.')); }
  static getMyProfile() { return isMockMode ? Promise.resolve(UserService.myProfile()) : Promise.reject(new Error('My profile API is not available in API mode.')); }
  static updateMyProfile(data: Pick<UserUpdateRequest, 'firstName' | 'middleName' | 'lastName' | 'preferredName' | 'gender' | 'dateOfBirth' | 'phone' | 'address'>) { return isMockMode ? Promise.resolve(UserService.updateMyProfile(data)) : Promise.reject(new Error('My profile API is not available in API mode.')); }
  static getUsers() { return isMockMode ? Promise.resolve(UserService.list()) : usersApi.getUsers(); }
  static getUser(id: string | number) { return isMockMode ? Promise.resolve(UserService.get(id)).then((user) => {
    if (!user) throw new Error('User not found'); return user;
  }) : usersApi.getUser(id); }
  static createUser(data: UserCreateRequest) { return isMockMode ? Promise.resolve(UserService.create(data)) : usersApi.createUser(data); }
  static updateUser(id: string, data: UserUpdateRequest) { return isMockMode ? Promise.resolve(UserService.update(id, data)) : usersApi.updateUser(id, data); }
  static setActive(id: string, isActive: boolean) { return isMockMode ? Promise.resolve(UserService.setActive(id, isActive)) : usersApi.setActive(id, isActive); }
}
