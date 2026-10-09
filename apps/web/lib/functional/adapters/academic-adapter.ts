import { isMockMode } from '../config';
import {
  fetchAcademicYears, postAcademicYear, fetchTerms, postTerm, fetchSchoolClasses, postSchoolClass,
  fetchSubjects, postSubject, fetchTeacherAssignments, fetchMyTeacherAssignments, postTeacherAssignment,
  patchTeacherAssignmentStatus, fetchEnrollments, postEnrollment, patchEnrollmentStatus,
  fetchTeacherAssignmentRoster,
  AcademicYearRequest, TermRequest, SchoolClassRequest, SubjectRequest, TeacherAssignmentRequest,
  AssignmentStatus, EnrollmentRequest, EnrollmentStatus,
} from '../../api/academic';
import { AcademicService } from '../services/academic-service';

export class AcademicAdapter {
  static getAcademicYears() { return isMockMode ? Promise.resolve(AcademicService.years()) : fetchAcademicYears(); }
  static createAcademicYear(data: AcademicYearRequest) { return isMockMode ? Promise.resolve(AcademicService.createYear(data)) : postAcademicYear(data); }
  static getTerms(yearId: string) { return isMockMode ? Promise.resolve(AcademicService.terms(yearId)) : fetchTerms(yearId); }
  static createTerm(yearId: string, data: TermRequest) { return isMockMode ? Promise.resolve(AcademicService.createTerm(yearId, data)) : postTerm(yearId, data); }
  static getSchoolClasses() { return isMockMode ? Promise.resolve(AcademicService.classes()) : fetchSchoolClasses(); }
  static createSchoolClass(data: SchoolClassRequest) { return isMockMode ? Promise.resolve(AcademicService.createClass(data)) : postSchoolClass(data); }
  static getSubjects() { return isMockMode ? Promise.resolve(AcademicService.subjects()) : fetchSubjects(); }
  static createSubject(data: SubjectRequest) { return isMockMode ? Promise.resolve(AcademicService.createSubject(data)) : postSubject(data); }
  static getTeacherAssignments() { return isMockMode ? Promise.resolve(AcademicService.assignments()) : fetchTeacherAssignments(); }
  static getMyTeacherAssignments(teacherId?: string) { return isMockMode ? Promise.resolve(AcademicService.myAssignments(teacherId)) : fetchMyTeacherAssignments(); }
  static getTeacherOptions() { return isMockMode ? Promise.resolve(AcademicService.teacherOptions()) : Promise.reject(new Error('Teacher directory is not available in API mode.')); }
  static createTeacherAssignment(data: TeacherAssignmentRequest) { return isMockMode ? Promise.resolve(AcademicService.createAssignment(data)) : postTeacherAssignment(data); }
  static updateTeacherAssignmentStatus(id: string, status: AssignmentStatus) { return isMockMode ? Promise.resolve(AcademicService.setAssignmentStatus(id, status)) : patchTeacherAssignmentStatus(id, status); }
  static getEnrollments() { return isMockMode ? Promise.resolve(AcademicService.enrollments()) : fetchEnrollments(); }
  static createEnrollment(data: EnrollmentRequest) { return isMockMode ? Promise.resolve(AcademicService.createEnrollment(data)) : postEnrollment(data); }
  static updateEnrollmentStatus(id: string, status: EnrollmentStatus) { return isMockMode ? Promise.resolve(AcademicService.setEnrollmentStatus(id, status)) : patchEnrollmentStatus(id, status); }
  static getTeacherAssignmentRoster(id: string) { 
    // In mock mode, this is handled in the hook. This shouldn't be called directly in mock mode.
    return fetchTeacherAssignmentRoster(id); 
  }
}
