import { MockDatabase } from '../storage/database';
import { StudentRecord } from '../types';

export class ParentRepository {
  static findChildrenForParent(parentUserId: string, tenantId: string): StudentRecord[] {
    return MockDatabase.getCollection('students').filter(
      (student) => student.guardianId === parentUserId && student.tenantId === tenantId,
    );
  }
}
