import { isMockMode } from '../config';
import { StudentResultService } from '../services/student-result-service';

export class StudentResultAdapter {
  static async getReportCard(studentId: string, academicYearId: string, termId: string) {
    if (!isMockMode) throw new Error('Student results API integration is not available yet.');
    return StudentResultService.reportCard(studentId, academicYearId, termId);
  }
}
