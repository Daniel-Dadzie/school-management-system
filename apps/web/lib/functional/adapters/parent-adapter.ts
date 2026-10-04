import { ParentService } from '../services/parent-service';
import { StudentRecord } from '../types';

export class ParentAdapter {
  static async getChildrenForParent(parentUserId: string): Promise<StudentRecord[]> {
    return ParentService.getChildrenForParent(parentUserId);
  }
}
