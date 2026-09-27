import { TenantRecord, UserRecord, StudentRecord, ClassRecord, AuditEventRecord, SubjectRecord, AcademicYearRecord, TermRecord, TeacherAssignmentRecord, EnrollmentRecord, AdmissionApplicationRecord, AttendanceRecord } from '../types';

export const defaultTenant: TenantRecord = {
  id: 'tenant-1',
  name: 'CarePoint Community School',
  subdomain: 'demo',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const defaultUsers: UserRecord[] = [
  {
    id: 'user-superadmin-1',
    tenantId: defaultTenant.id,
    username: 'superadmin',
    email: 'superadmin@carepoint.demo',
    password: 'password',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-admin-1',
    tenantId: defaultTenant.id,
    username: 'admin',
    email: 'admin@carepoint.demo',
    password: 'password',
    firstName: 'School',
    lastName: 'Admin',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-teacher-1',
    tenantId: defaultTenant.id,
    username: 'teacher',
    email: 'teacher@carepoint.demo',
    password: 'password',
    firstName: 'Demo',
    lastName: 'Teacher',
    role: 'TEACHER',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-parent-1',
    tenantId: defaultTenant.id,
    username: 'parent',
    email: 'parent@carepoint.demo',
    password: 'password',
    firstName: 'Demo',
    lastName: 'Parent',
    role: 'PARENT',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const defaultStudents: StudentRecord[] = [
  {
    id: 'student-1',
    tenantId: 'tenant-1',
    firstName: 'Demo',
    lastName: 'Student 1',
    enrollmentId: 'enr-1',
    currentClassId: 'class-1',
    dateOfBirth: '2010-05-10',
    guardianId: 'user-parent-1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'student-2',
    tenantId: 'tenant-1',
    firstName: 'Demo',
    lastName: 'Student 2',
    enrollmentId: 'enr-2',
    currentClassId: 'class-1',
    dateOfBirth: '2011-03-20',
    guardianId: 'user-parent-1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const defaultClasses: ClassRecord[] = [
  {
    id: 'class-1',
    tenantId: 'tenant-1',
    name: 'Grade 10A',
    gradeLevel: 'Grade 10',
    academicYearId: 'year-1',
    formTeacherId: 'user-teacher-1',
    capacity: 30
  }
];

export const defaultAuditLogs: AuditEventRecord[] = [];


export const defaultAcademicYears: AcademicYearRecord[] = [
  {
    id: 'year-1',
    tenantId: 'tenant-1',
    name: '2026/2027',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2027-07-31T00:00:00Z',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

export const defaultTerms: TermRecord[] = [
  {
    id: 'term-1',
    tenantId: 'tenant-1',
    academicYearId: 'year-1',
    name: 'First Term',
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-12-15T00:00:00Z',
    isMandatory: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'term-2',
    tenantId: 'tenant-1',
    academicYearId: 'year-1',
    name: 'Second Term',
    startDate: '2027-01-05T00:00:00Z',
    endDate: '2027-04-10T00:00:00Z',
    isMandatory: true,
    createdAt: new Date().toISOString()
  }
];

export const defaultSubjects: SubjectRecord[] = [
  {
    id: 'sub-1',
    tenantId: 'tenant-1',
    name: 'Mathematics',
    code: 'MATH101',
    department: 'Science',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sub-2',
    tenantId: 'tenant-1',
    name: 'English Literature',
    code: 'ENG101',
    department: 'Arts',
    createdAt: new Date().toISOString()
  }
];

export const defaultTeacherAssignments: TeacherAssignmentRecord[] = [
  {
    id: 'ta-1',
    tenantId: 'tenant-1',
    teacherId: 'user-teacher-1',
    subjectId: 'sub-1',
    schoolClassId: 'class-1',
    academicYearId: 'year-1',
    termId: 'term-1',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

export const defaultEnrollments: EnrollmentRecord[] = [
  {
    id: 'enr-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    schoolClassId: 'class-1',
    academicYearId: 'year-1',
    status: 'ACTIVE',
    enrolledAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'enr-2',
    tenantId: 'tenant-1',
    studentId: 'student-2',
    schoolClassId: 'class-1',
    academicYearId: 'year-1',
    status: 'ACTIVE',
    enrolledAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export const defaultAdmissions: AdmissionApplicationRecord[] = [
  {
    id: 'adm-1',
    tenantId: 'tenant-1',
    studentFirstName: 'Demo',
    studentLastName: 'Applicant',
    studentDateOfBirth: '2015-05-15',
    guardianName: 'Demo Guardian',
    guardianEmail: 'parent@carepoint.demo',
    guardianPhone: '555-0100',
    applyingForClassId: 'class-1',
    applyingForYearId: 'year-1',
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

export const defaultAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    tenantId: 'tenant-1',
    studentId: 'student-1',
    schoolClassId: 'class-1',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    termId: 'term-1',
    academicYearId: 'year-1',
    recordedById: 'user-teacher-1',
    createdAt: new Date().toISOString()
  }
];
