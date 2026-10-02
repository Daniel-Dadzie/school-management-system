import { isMockMode } from '../config';
import { StudentResultService } from '../services/student-result-service';

export class StudentResultAdapter {
  static async publishReportCard(studentId: string, academicYearId: string, termId: string) {
    if (!isMockMode) throw new Error('Student results API integration is not available yet.');
    return StudentResultService.publishReportCard(studentId, academicYearId, termId);
  }

  static async saveComments(studentId: string, academicYearId: string, termId: string, classTeacherComment?: string, headTeacherComment?: string) {
    if (!isMockMode) throw new Error('Student results API integration is not available yet.');
    return StudentResultService.saveComments(studentId, academicYearId, termId, classTeacherComment, headTeacherComment);
  }
  static async getReportCard(studentId: string, academicYearId: string, termId: string) {
    if (!isMockMode) throw new Error('Student results API integration is not available yet.');
    return StudentResultService.reportCard(studentId, academicYearId, termId);
  }

  static async generateReportCardPdf(studentId: string, academicYearId: string, termId: string): Promise<string> {
    if (!isMockMode) throw new Error('Student results API integration is not available yet.');
    return StudentResultService.generateReportCardPdf(studentId, academicYearId, termId);
  }
}

