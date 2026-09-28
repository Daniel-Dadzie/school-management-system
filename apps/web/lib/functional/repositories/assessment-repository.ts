import { MockDatabase } from '../storage/database';
import { AssessmentRecord, AssessmentResultRecord } from '../types';

export class AssessmentRepository {
  static findAll(): AssessmentRecord[] {
    return MockDatabase.getStore().assessments;
  }

  static findById(id: string): AssessmentRecord | undefined {
    return this.findAll().find((assessment) => assessment.id === id);
  }

  static save(assessment: AssessmentRecord): AssessmentRecord {
    const records = this.findAll();
    const index = records.findIndex((record) => record.id === assessment.id);
    const nextRecords = [...records];
    if (index >= 0) nextRecords[index] = assessment;
    else nextRecords.push(assessment);
    MockDatabase.setCollection('assessments', nextRecords);
    return assessment;
  }

  static findResults(assessmentId: string): AssessmentResultRecord[] {
    return MockDatabase.getStore().assessmentResults.filter(
      (result) => result.assessmentId === assessmentId,
    );
  }

  static saveResult(result: AssessmentResultRecord): AssessmentResultRecord {
    const records = MockDatabase.getStore().assessmentResults;
    const existing = records.findIndex(
      (record) => record.assessmentId === result.assessmentId && (record.enrollmentId === result.enrollmentId || record.studentId === result.studentId),
    );
    const nextRecords = [...records];
    if (existing >= 0) nextRecords[existing] = result;
    else nextRecords.push(result);
    MockDatabase.setCollection('assessmentResults', nextRecords);
    return result;
  }

  static saveResults(results: AssessmentResultRecord[]): AssessmentResultRecord[] {
    const records = MockDatabase.getStore().assessmentResults;
    const updates = new Map(results.map((result) => [`${result.assessmentId}:${result.studentId}`, result]));
    const next = records.filter((record) => !updates.has(`${record.assessmentId}:${record.studentId}`));
    MockDatabase.setCollection('assessmentResults', [...next, ...results]);
    return results;
  }
}
