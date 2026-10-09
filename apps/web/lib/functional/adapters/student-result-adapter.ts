import { isMockMode } from '../config';
import { StudentResultService } from '../services/student-result-service';
import type { StudentReportCard } from '../types';


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
    if (isMockMode) return StudentResultService.reportCard(studentId, academicYearId, termId);
    
    const { apiClient } = await import("@/lib/api/client");
    let snapshot: any;
    try {
      snapshot = await apiClient(`/reporting/snapshots/student/${studentId}?academicYearId=${academicYearId}&termId=${termId}`);
    } catch (e: any) {
      if (e.status === 404) return null;
      throw e;
    }

    if (!snapshot) return null;

    // Fetch student info to satisfy the UI interface (UI needs name, etc.)
    const student = await apiClient(`/people/students/${studentId}`);
    
    return {
      student,
      academicYearId: snapshot.academicYearId,
      termId: snapshot.termId,
      classId: snapshot.enrollmentId, // Close enough, we don't have classId in snapshot directly.
      subjects: snapshot.results?.map((res: any) => ({
        subjectId: res.id,
        subjectName: res.subjectName,
        assessments: [], // Snapshot doesn't include individual assessments
        totalWeightPercent: 100,
        totalPercentage: res.totalScore,
        grade: res.grade,
        remark: res.remark,
        isComplete: true,
      })) ?? [],
      comments: {
        status: snapshot.status,
        classTeacher: snapshot.teacherComment,
        headTeacher: snapshot.headteacherComment,
        publishedAt: snapshot.publishedAt,
      },
      position: snapshot.overallRank ? { rank: snapshot.overallRank, total: snapshot.overallRank } : undefined,
      progress: { currentAverage: snapshot.overallScore },
      attendance: { present: 0, absent: 0, late: 0, excused: 0 },
    } as StudentReportCard;
  }

  static async generateReportCardPdf(studentId: string, academicYearId: string, termId: string): Promise<string> {
    if (isMockMode) return StudentResultService.generateReportCardPdf(studentId, academicYearId, termId);
    
    const { useAuthStore } = await import("@/stores/auth-store");
    const token = useAuthStore.getState().accessToken;
    const { API_BASE_URL } = await import("@/lib/api/client");
    
    const response = await fetch(`${API_BASE_URL}/reporting/snapshots/student/${studentId}/pdf?academicYearId=${academicYearId}&termId=${termId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error("Failed to generate PDF");
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}

