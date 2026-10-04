export type Role = 'SUPER_ADMIN' | 'IT_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT';

export const ROLES: readonly Role[] = ['SUPER_ADMIN', 'IT_ADMIN', 'ADMIN', 'TEACHER', 'PARENT'];
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
  photoUrl?: string;
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

export type PromotionDecision = 'PROMOTE' | 'RETAIN';

export interface PromotionRecord {
  id: string;
  tenantId: string;
  studentId: string;
  fromEnrollmentId: string;
  toEnrollmentId: string;
  sourceAcademicYearId: string;
  academicYearId: string;
  fromClassId: string;
  destinationClassId: string;
  decision: PromotionDecision;
  notes: string;
  decidedBy: string;
  decidedAt: string;
  createdAt: string;
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
  enteredBy?: string;
  status?: AssessmentResultStatus;
  finalizedAt?: string;
  gradingScaleId?: string;
  percentage?: number;
  grade?: string;
  gradePoint?: number;
  remark?: string;
  weightedContribution?: number;
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

export interface StudentReportCard {
  student: StudentRecord;
  academicYearId: string;
  termId: string;
  classId: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    assessments: Array<{ assessmentId: string; title: string; score?: number; maximumScore: number; weightPercent: number; percentage?: number; grade?: string; remark?: string; status: 'MISSING' | 'ENTERED' | 'FINALIZED' }>;
    totalWeightPercent: number;
    totalPercentage?: number;
    grade?: string;
    gradePoint?: number;
    remark?: string;
    isComplete: boolean;
  }>;
  attendance: { present: number; absent: number; late: number; excused: number };
  comments?: { classTeacher?: string; headTeacher?: string;
    status?: 'DRAFT' | 'PUBLISHED'; publishedAt?: string; publishedBy?: string; };
  gradingScale?: GradeScaleRecord;
  position?: { rank: number; total: number };
  progress?: { currentAverage?: number; previousAverage?: number };
  promotion?: PromotionRecord;
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
  address?: string;
  primaryColor: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type FeeStatus = 'ACTIVE' | 'INACTIVE';
export interface FeeStructureRecord { id: string; tenantId: string; name: string; academicYearId: string; termId: string; schoolClassId: string; status: FeeStatus; createdBy: string; createdAt: string; updatedAt: string; }
export interface FeeItemRecord { id: string; tenantId: string; feeStructureId: string; name: string; description?: string; amountMinor: number; }
export interface StudentChargeRecord { id: string; tenantId: string; studentId: string; enrollmentId: string; feeStructureId: string; feeItemId: string; description: string; amountMinor: number; createdAt: string; }
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID';
export interface InvoiceRecord { id: string; tenantId: string; invoiceNumber: string; studentId: string; enrollmentId: string; academicYearId: string; termId: string; feeStructureId: string; issuedOn: string; dueOn: string; createdBy: string; createdAt: string; voidReason?: string; voidedAt?: string; }
export interface InvoiceLineItemRecord { id: string; tenantId: string; invoiceId: string; description: string; amountMinor: number; }
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CARD' | 'WALLET';
export interface PaymentRecord { id: string; tenantId: string; receiptNumber: string; invoiceId: string; studentId: string; amountMinor: number; paymentDate: string; method: PaymentMethod; reference: string; status: 'RECORDED' | 'VOID'; recordedBy: string; channel: 'STAFF' | 'PARENT'; notes?: string; createdAt: string; }
export type PaymentPlanCadence = 'MONTHLY' | 'CUSTOM';
export type PaymentPlanStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export interface PaymentPlanRecord { id: string; tenantId: string; invoiceId: string; studentId: string; cadence: PaymentPlanCadence; installmentCount: number; status: PaymentPlanStatus; createdBy: string; createdAt: string; }
export type InstallmentStatus = 'DUE' | 'PAID' | 'OVERDUE';
export interface PaymentInstallmentRecord { id: string; tenantId: string; paymentPlanId: string; invoiceId: string; installmentNumber: number; dueOn: string; amountMinor: number; paidMinor: number; status: InstallmentStatus; }
export type FeeAdjustmentType = 'DISCOUNT' | 'SCHOLARSHIP' | 'WAIVER' | 'CREDIT';
export interface FeeAdjustmentRecord { id: string; tenantId: string; invoiceId: string; studentId: string; type: FeeAdjustmentType; description: string; amountMinor: number; createdBy: string; createdAt: string; }
export interface ReconciliationRecord { id: string; tenantId: string; reconciliationDate: string; method: PaymentMethod; expectedMinor: number; recordedMinor: number; varianceMinor: number; status: 'OPEN' | 'RECONCILED'; reconciledBy?: string; createdAt: string; }

export interface ReportCardConfigurationRecord {
  id: string;
  tenantId: string;
  showLogo: boolean;
  showWatermark: boolean;
  showSchoolAddress: boolean;
  showContactInformation: boolean;
  showMotto: boolean;
  showStudentPhoto: boolean;
  showDateOfBirth: boolean;
  showGender: boolean;
  showStudentId: boolean;
  showClass: boolean;
  showAcademicYear: boolean;
  showTerm: boolean;
  showTermDates: boolean;
  showReportIssueDate: boolean;
  showAssessmentBreakdown: boolean;
  showSubjectTotals: boolean;
  showGrades: boolean;
  showGradePoints: boolean;
  showRemarks: boolean;
  showAttendance: boolean;
  showPosition: boolean;
  showOverallAverage: boolean;
  showClassTeacherComment: boolean;
  showHeadTeacherComment: boolean;
  showPromotionStatus: boolean;
  showSignatureAreas: boolean;
  footerText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportCardCommentRecord {
  id: string;
  tenantId: string;
  studentId: string;
  enrollmentId: string;
  academicYearId: string;
  termId: string;
  classTeacherComment?: string;
  headTeacherComment?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';
export interface NotificationRecord { id: string; tenantId: string; userId: string; title: string; message: string; status: NotificationStatus; createdAt: string; link?: string; }

export interface FamilyWalletRecord { id: string; tenantId: string; parentId: string; balanceMinor: number; updatedAt: string; }
export interface FamilyWalletTransactionRecord { id: string; tenantId: string; parentId: string; amountMinor: number; type: 'DEPOSIT' | 'WITHDRAWAL'; reference: string; description: string; createdAt: string; }

// ─── Discipline / Incidents ───────────────────────────────────────────────────
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus   = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
export type IncidentCategory = 'BEHAVIOUR' | 'BULLYING' | 'ATTENDANCE' | 'ACADEMIC_DISHONESTY' | 'PROPERTY_DAMAGE' | 'HEALTH' | 'OTHER';

export interface IncidentRecord {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  studentId: string;
  location?: string;
  classId?: string;
  reportedBy: string;
  resolvedBy?: string;
  resolvedAt?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Calendar / Events ────────────────────────────────────────────────────────
export type CalendarEventType = 'HOLIDAY' | 'EXAM' | 'MEETING' | 'SPORTS' | 'CULTURAL' | 'OTHER';

export interface CalendarEventRecord {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  createdBy: string;
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
  promotionRecords: PromotionRecord[];
  admissions: AdmissionApplicationRecord[];
  attendance: AttendanceRecord[];
  assessments: AssessmentRecord[];
  assessmentResults: AssessmentResultRecord[];
  assessmentCategories: AssessmentCategoryRecord[];
  gradeScales: GradeScaleRecord[];
  settings: SettingsRecord[];
  feeStructures: FeeStructureRecord[];
  feeItems: FeeItemRecord[];
  studentCharges: StudentChargeRecord[];
  invoices: InvoiceRecord[];
  invoiceLineItems: InvoiceLineItemRecord[];
  payments: PaymentRecord[];
  paymentPlans: PaymentPlanRecord[];
  paymentInstallments: PaymentInstallmentRecord[];
  feeAdjustments: FeeAdjustmentRecord[];
  reconciliations: ReconciliationRecord[];
  familyWallets: FamilyWalletRecord[];
  familyWalletTransactions: FamilyWalletTransactionRecord[];
  reportCardConfigurations: ReportCardConfigurationRecord[];
  reportCardComments: ReportCardCommentRecord[];
  incidents: IncidentRecord[];
  calendarEvents: CalendarEventRecord[];
  notifications: NotificationRecord[];
}







