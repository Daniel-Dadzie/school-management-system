import { MockDatabase } from '../storage/database';
import { AssessmentCategoryRecord, GradeScaleRecord } from '../types';

export class GradingRepository {
  static categories(): AssessmentCategoryRecord[] { return MockDatabase.getStore().assessmentCategories; }
  static saveCategory(category: AssessmentCategoryRecord): AssessmentCategoryRecord {
    const records = this.categories();
    MockDatabase.setCollection('assessmentCategories', [...records.filter((record) => record.id !== category.id), category]);
    return category;
  }
  static scales(): GradeScaleRecord[] { return MockDatabase.getStore().gradeScales; }
  static findScale(id: string): GradeScaleRecord | undefined { return this.scales().find((scale) => scale.id === id); }
  static saveScale(scale: GradeScaleRecord): GradeScaleRecord {
    const records = this.scales();
    MockDatabase.setCollection('gradeScales', [...records.filter((record) => record.id !== scale.id), scale]);
    return scale;
  }
}
