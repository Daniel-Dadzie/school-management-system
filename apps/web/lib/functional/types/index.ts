export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';

export const ROLES: readonly Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT'];
export const isRole = (value: string): value is Role => ROLES.includes(value as Role);

export interface TenantRecord {
  id: string;
  name: string;
  subdomain: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfileRecord {
  id: string;
  tenantId: string;
  userId: string;
  staffId: string;
  qualification?: string;
  specialization?: string;
  employmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecord {
  id: string;
  studentId?: string;
  tenantId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender?: string;
  enrollmentId: string;
  currentClassId: string;
  dateOfBirth: string;
  guardianId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface ClassRecord {
  id: string;
  tenantId: string;
  name: string;
  gradeLevel: string;
  academicYearId: string;
  formTeacherId?: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditEventRecord {
  id: string;
  tenantId: string;
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'UPDATE' | 'CREATE' | 'DELETE';
  entityType: string;
  entityId?: string;
  details?: string; // stringified JSON to avoid 'unknown' or 'any' type dictionaries
  ipAddress?: string;
  createdAt: string;
}

export interface AuthSession {
  user: Omit<UserRecord, 'password'>;
  token: string;
}


export interface SubjectRecord {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AcademicYearRecord {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
}

export interface TermRecord {
  id: string;
  tenantId: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  isMandatory: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface TeacherAssignmentRecord {
  id: string;
  tenantId: string;
  teacherId: string;
  subjectId: string;
  schoolClassId: string;
  academicYearId: string;
  termId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface EnrollmentRecord {
  id: string;
  tenantId: string;
  studentId: string;
  schoolClassId: string;
  academicYearId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRANSFERRED' | 'WITHDRAWN';
  enrolledAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdmissionApplicationRecord {
  id: string;
  tenantId: string;
  studentFirstName: string;
  studentLastName: string;
  studentDateOfBirth: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  applyingForClassId: string;
  applyingForYearId: string;
  gender?: string;
  relationship?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'ACCEPTED' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
  submittedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  studentId: string;
  schoolClassId: string;
  subjectId?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  termId: string;
  academicYearId: string;
  notes?: string;
  recordedById: string;
  createdAt: string;
  updatedAt?: string;
}

export type AssessmentStatus = 'DRAFT' | 'REJECTED';
export type AssessmentResultOutcome = 'PASSED' | 'FAILED';

export interface AssessmentRecord {
  id: string;
  tenantId: string;
  title: string;
  termId: string;
  classId: string;
  subjectId: string;
  categoryId?: string;
  description?: string;
  assessmentDate?: string;
  maximumScore?: number;
  weightPercent?: number;
  createdBy?: string;
  status: AssessmentStatus;
  isCurrentFinal: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  rejectedAt?: string;
}

export interface AssessmentResultRecord {
  id: string;
  tenantId: string;
  assessmentId: string;
  enrollmentId: string;
  studentId: string;
  score: number;
  outcome?: AssessmentResultOutcome;
  enteredBy?: string;
  status?: AssessmentResultStatus;
  finalizedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssessmentResultStatus = 'ENTERED' | 'FINALIZED';

export interface AssessmentCategoryRecord {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface GradeBandRecord {
  id: string;
  grade: string;
  minimumPercentage: number;
  maximumPercentage: number;
  gradePoint?: number;
  remark: string;
  sortOrder: number;
}

export interface GradeScaleRecord {
  id: string;
  tenantId: string;
  academicYearId: string;
  name: string;
  isActive: boolean;
  bands: GradeBandRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface GradeEvaluation {
  percentage: number;
  grade: string;
  gradePoint?: number;
  remark: string;
  weightedContribution: number;
}

export interface StudentSubjectResult {
  studentId: string;
  enrollmentId: string;
  academicYearId: string;
  termId: string;
  classId: string;
  subjectId: string;
  gradingScaleId: string;
  assessmentCount: number;
  totalWeightPercent: number;
  totalPercentage: number;
  grade: string;
  gradePoint?: number;
  remark: string;
  isFinalized: boolean;
}

export type AssessmentCreateRequest = Pick<AssessmentRecord,
  'title' | 'termId' | 'classId' | 'subjectId' | 'isCurrentFinal'> & {
    categoryId: string;
    description?: string;
    assessmentDate: string;
    maximumScore: number;
    weightPercent: number;
  };

export type AssessmentUpdateRequest = Partial<AssessmentCreateRequest>;

export type AssessmentResultInput = Pick<AssessmentResultRecord, 'enrollmentId' | 'studentId'> & {
  score?: number | null;
};

export interface SettingsRecord {
  id: string;
  tenantId: string;
  institutionName: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface MockStore {
  version: number;
  tenants: TenantRecord[];
  users: UserRecord[];
  teacherProfiles: TeacherProfileRecord[];
  students: StudentRecord[];
  classes: ClassRecord[];
  auditEvents: AuditEventRecord[];
  subjects: SubjectRecord[];
  academicYears: AcademicYearRecord[];
  terms: TermRecord[];
  teacherAssignments: TeacherAssignmentRecord[];
  enrollments: EnrollmentRecord[];
  admissions: AdmissionApplicationRecord[];
  attendance: AttendanceRecord[];
  assessments: AssessmentRecord[];
  assessmentResults: AssessmentResultRecord[];
  assessmentCategories: AssessmentCategoryRecord[];
  gradeScales: GradeScaleRecord[];
  settings: SettingsRecord[];
}

