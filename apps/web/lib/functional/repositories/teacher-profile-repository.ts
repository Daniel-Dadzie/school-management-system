import { MockDatabase } from '../storage/database';
import type { TeacherProfileRecord } from '../types';

export class TeacherProfileRepository {
  static findByUserId(userId: string): TeacherProfileRecord | undefined {
    return MockDatabase.getStore().teacherProfiles.find((profile) => profile.userId === userId);
  }

  static save(profile: TeacherProfileRecord): TeacherProfileRecord {
    const store = MockDatabase.getStore();
    const index = store.teacherProfiles.findIndex((item) => item.userId === profile.userId);
    if (index < 0) store.teacherProfiles.push(profile);
    else store.teacherProfiles[index] = profile;
    MockDatabase.saveStore(store);
    return profile;
  }
}
