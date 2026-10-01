import { hasPermission, permissions } from '@/lib/authorization/permissions';
import { useAuthStore } from '@/stores/auth-store';
import { AssessmentDomainError } from '../errors/assessment-domain-error';
import { GradingService } from './grading-service';
import { MockDatabase } from '../storage/database';
import { StudentReportCard } from '../types';

export class StudentResultService {
  static publishReportCard(studentId: string, academicYearId: string, termId: string): import('../types').ReportCardCommentRecord {
    const user = useAuthStore.getState().user;
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN') {
      throw new AssessmentDomainError('FORBIDDEN', 'Only administrators can publish report cards.');
    }
    const store = MockDatabase.getStore();
    const student = store.students.find((item) => item.tenantId === user?.tenantId && item.id === studentId);
    if (!student) throw new AssessmentDomainError('NOT_FOUND', 'Student not found.');

    const yearEnrollments = store.enrollments.filter((item) => item.tenantId === user?.tenantId && item.studentId === student.id && item.academicYearId === academicYearId);
    const enrollment = yearEnrollments.find((item) => item.status === 'ACTIVE') ?? yearEnrollments[0];
    if (!enrollment) throw new AssessmentDomainError('INVALID', 'No class enrollment exists for the selected academic year.');

    let comment = store.reportCardComments?.find(c => c.enrollmentId === enrollment.id);
    const now = new Date().toISOString();
    
    if (comment) {
      comment.status = 'PUBLISHED';
      comment.updatedAt = now;
    } else {
      comment = {
        id: 'comment-' + Date.now(),
        tenantId: user?.tenantId ?? 'tenant-1',
        studentId: student.id,
        enrollmentId: enrollment.id,
        academicYearId,
        termId,
        status: 'PUBLISHED',
        createdAt: now,
        updatedAt: now,
      };
      if (!store.reportCardComments) store.reportCardComments = [];
      store.reportCardComments.push(comment as import('../types').ReportCardCommentRecord);
    }
    
    MockDatabase.saveStore(store);
    return comment as import('../types').ReportCardCommentRecord;
  }
  static saveComments(studentId: string, academicYearId: string, termId: string, classTeacherComment?: string, headTeacherComment?: string): import('../types').ReportCardCommentRecord {
    const user = useAuthStore.getState().user;
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'ADMIN' && user?.role !== 'TEACHER') {
      throw new AssessmentDomainError('FORBIDDEN', 'You cannot save report card comments.');
    }
    const store = MockDatabase.getStore();
    const student = store.students.find((item) => item.id === studentId && item.tenantId === user?.tenantId);
    if (!student) throw new AssessmentDomainError('NOT_FOUND', 'Student not found.');
    
    const yearEnrollments = store.enrollments.filter((item) => item.studentId === student.id && item.academicYearId === academicYearId && item.tenantId === user?.tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const enrollment = yearEnrollments.find((item) => item.status === 'ACTIVE') ?? yearEnrollments[0];
    if (!enrollment) throw new AssessmentDomainError('INVALID', 'No class enrollment exists for the selected academic year.');

    let comment = store.reportCardComments?.find(c => c.enrollmentId === enrollment.id);
    const now = new Date().toISOString();
    
    if (comment) {
      if (classTeacherComment !== undefined) comment.classTeacherComment = classTeacherComment;
      if (headTeacherComment !== undefined) comment.headTeacherComment = headTeacherComment;
      comment.updatedAt = now;
    } else {
      comment = {
        id: crypto.randomUUID(),
        tenantId: user!.tenantId ?? '',
        studentId,
        enrollmentId: enrollment.id,
        academicYearId,
        termId,
        classTeacherComment,
        headTeacherComment,
        createdAt: now,
        updatedAt: now,
      };
      if (!store.reportCardComments) store.reportCardComments = [];
      store.reportCardComments.push(comment as import('../types').ReportCardCommentRecord);
    }
    
    MockDatabase.saveStore(store);
    return comment as import('../types').ReportCardCommentRecord;
  }
  static reportCard(studentId: string, academicYearId: string, termId: string): StudentReportCard {
    const user = useAuthStore.getState().user;
    if (!hasPermission(user?.role, permissions.resultsView)) throw new AssessmentDomainError('FORBIDDEN', 'You cannot view student results.');
    const store = MockDatabase.getStore();
    const student = store.students.find((item) => item.id === studentId && item.tenantId === user?.tenantId);
    if (!student || (user?.role === 'PARENT' && student.guardianId !== user.id)) throw new AssessmentDomainError('NOT_FOUND', 'Student not found.');
    const term = store.terms.find((item) => item.id === termId && item.tenantId === user?.tenantId && item.academicYearId === academicYearId);
    if (!term) throw new AssessmentDomainError('INVALID', 'Choose a valid term in this academic year.');
    const yearEnrollments = store.enrollments.filter((item) => item.studentId === student.id && item.academicYearId === academicYearId && item.tenantId === user?.tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const enrollment = yearEnrollments.find((item) => item.status === 'ACTIVE') ?? yearEnrollments[0];
    const schoolClass = enrollment && store.classes.find((item) => item.id === enrollment.schoolClassId && item.tenantId === user?.tenantId && item.academicYearId === academicYearId);
    if (!enrollment || !schoolClass) throw new AssessmentDomainError('INVALID', 'No class enrollment exists for the selected academic year.');
    const assessments = store.assessments.filter((item) => item.tenantId === user?.tenantId && item.termId === termId && item.classId === schoolClass.id && item.status !== 'REJECTED');
    if (user?.role === 'TEACHER' && assessments.some((assessment) => !store.teacherAssignments.some((assignment) => assignment.teacherId === user.id && assignment.tenantId === user.tenantId && assignment.status === 'ACTIVE' && assignment.schoolClassId === schoolClass.id && assignment.subjectId === assessment.subjectId && assignment.academicYearId === academicYearId && assignment.termId === termId))) {
      throw new AssessmentDomainError('FORBIDDEN', 'This report card includes subjects outside your active teaching assignments.');
    }
    const scale = GradingService.activeScale(user?.tenantId ?? '', academicYearId);
    const subjectIds = [...new Set(assessments.map((item) => item.subjectId))];
    const subjects = subjectIds.map((subjectId) => {
      const subjectAssessments = assessments.filter((item) => item.subjectId === subjectId);
      const rows = subjectAssessments.map((assessment) => {
        const result = store.assessmentResults.find((item) => item.assessmentId === assessment.id && item.enrollmentId === enrollment.id);
        const max = assessment.maximumScore ?? 100;
        const percentage = result ? Math.round(result.score / max * 10000) / 100 : undefined;
        const resultScale = result?.gradingScaleId ? GradingService.findScale(result.gradingScaleId) : scale;
        const evaluation = result && resultScale ? GradingService.evaluate(result.score, max, assessment.weightPercent ?? 0, resultScale) : undefined;
        return { assessmentId: assessment.id, title: assessment.title, score: result?.score, maximumScore: max, weightPercent: assessment.weightPercent ?? 0, percentage, grade: evaluation?.grade, remark: evaluation?.remark, status: !result ? 'MISSING' as const : result.status === 'FINALIZED' ? 'FINALIZED' as const : 'ENTERED' as const };
      });
      const totalWeightPercent = rows.reduce((sum, row) => sum + row.weightPercent, 0);
      const isComplete = Boolean(scale) && rows.length > 0 && Math.abs(totalWeightPercent - 100) <= 0.01 && rows.every((row) => row.status === 'FINALIZED' && row.percentage !== undefined);
      const totalPercentage = isComplete ? Math.round(rows.reduce((sum, row) => sum + (row.percentage ?? 0) * row.weightPercent / 100, 0) * 100) / 100 : undefined;
      const finalGrade = totalPercentage !== undefined ? scale?.bands.find((band) => totalPercentage >= band.minimumPercentage && (totalPercentage <= band.maximumPercentage || band.maximumPercentage === 100)) : undefined;
      return { subjectId, subjectName: store.subjects.find((item) => item.id === subjectId)?.name ?? 'Subject unavailable', assessments: rows, totalWeightPercent, totalPercentage, grade: finalGrade?.grade, gradePoint: finalGrade?.gradePoint, remark: finalGrade?.remark, isComplete };
    });
    const attendanceRows = store.attendance.filter((item) => item.tenantId === user?.tenantId && item.studentId === student.id && item.termId === termId && item.academicYearId === academicYearId);
    return {
      student, academicYearId, termId, classId: schoolClass.id, subjects,
      comments: { status: store.reportCardComments?.find(c => c.enrollmentId === enrollment.id)?.status, classTeacher: store.reportCardComments?.find(c => c.enrollmentId === enrollment.id)?.classTeacherComment, headTeacher: store.reportCardComments?.find(c => c.enrollmentId === enrollment.id)?.headTeacherComment },
      promotion: store.promotionRecords?.find(p => p.studentId === student.id && p.academicYearId === academicYearId && (p.fromEnrollmentId === enrollment.id || p.tenantId === user?.tenantId)),
      attendance: {
        present: attendanceRows.filter((item) => item.status === 'PRESENT').length,
        absent: attendanceRows.filter((item) => item.status === 'ABSENT').length,
        late: attendanceRows.filter((item) => item.status === 'LATE').length,
        excused: attendanceRows.filter((item) => item.status === 'EXCUSED').length,
      },
    };
  }
}






