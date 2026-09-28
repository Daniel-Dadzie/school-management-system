import { MockDatabase } from '../storage/database';
import { AssessmentCategoryRecord, GradeScaleRecord } from '../types';

export class GradingRepository {
  static categories(): AssessmentCategoryRecord[] { return MockDatabase.getStore().assessmentCategories; }
  static scales(): GradeScaleRecord[] { return MockDatabase.getStore().gradeScales; }
  static saveScale(scale: GradeScaleRecord): GradeScaleRecord {
    const records = this.scales();
    MockDatabase.setCollection('gradeScales', [...records.filter((record) => record.id !== scale.id), scale]);
    return scale;
  }
}
