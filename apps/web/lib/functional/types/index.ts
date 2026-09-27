export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';

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
  lastName: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecord {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
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
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  termId: string;
  academicYearId: string;
  notes?: string;
  recordedById: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MockStore {
  version: number;
  tenants: TenantRecord[];
  users: UserRecord[];
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
}
