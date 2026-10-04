import type { AdmissionApplicationResponse, AdmissionStatus, AdmissionStatusUpdateRequest } from '../../api/admissions';
import { AdmissionRepository } from '../repositories/admission-repository';
import { MockDatabase } from '../storage/database';
import { AdmissionApplicationRecord } from '../types';
import { assertPermission, permissions } from '@/lib/authorization/permissions';

export interface AdmissionApplicationRequest {
  studentFirstName: string; studentLastName: string; dateOfBirth: string; gender: string;
  applyingForClass: string; parentName: string; parentEmail: string; parentPhone: string;
  relationship: string; additionalNotes?: string;
}

const displayStatus = (status: AdmissionApplicationRecord['status']): AdmissionStatus => {
  if (status === 'SUBMITTED' || status === 'DRAFT') return 'PENDING';
  if (status === 'ACCEPTED') return 'APPROVED';
  if (status === 'PENDING' || status === 'UNDER_REVIEW' || status === 'APPROVED' || status === 'REJECTED') return status;
  return 'PENDING';
};

const toResponse = (record: AdmissionApplicationRecord): AdmissionApplicationResponse => {
  const store = MockDatabase.getStore();
  const schoolClass = store.classes.find((item) => item.id === record.applyingForClassId);
  return {
    id: record.id, studentFirstName: record.studentFirstName, studentLastName: record.studentLastName,
    dateOfBirth: record.studentDateOfBirth, gender: record.gender ?? '',
    applyingForClass: schoolClass?.name ?? record.applyingForClassId,
    parentName: record.guardianName, parentEmail: record.guardianEmail, parentPhone: record.guardianPhone,
    relationship: record.relationship ?? 'GUARDIAN', additionalNotes: record.notes,
    status: displayStatus(record.status), createdAt: record.submittedAt ?? record.createdAt,
  };
};

export class AdmissionService {
  static list(): AdmissionApplicationResponse[] { assertPermission(permissions.admissionsView); return AdmissionRepository.findAll().map(toResponse); }
  static get(id: string | number): AdmissionApplicationResponse | null {
    assertPermission(permissions.admissionsView);
    const record = AdmissionRepository.findById(String(id)); return record ? toResponse(record) : null;
  }
  static submit(data: AdmissionApplicationRequest): AdmissionApplicationResponse {
    const timestamp = new Date().toISOString();
    const store = MockDatabase.getStore();
    const schoolClass = store.classes.find((item) => item.name === data.applyingForClass || item.gradeLevel === data.applyingForClass);
    const record: AdmissionApplicationRecord = {
      id: `admission-${globalThis.crypto.randomUUID()}`, tenantId: store.tenants[0].id,
      studentFirstName: data.studentFirstName.trim(), studentLastName: data.studentLastName.trim(),
      studentDateOfBirth: data.dateOfBirth, gender: data.gender,
      guardianName: data.parentName.trim(), guardianEmail: data.parentEmail.trim().toLowerCase(),
      guardianPhone: data.parentPhone.trim(), relationship: data.relationship,
      applyingForClassId: schoolClass?.id ?? data.applyingForClass,
      applyingForYearId: store.academicYears[0]?.id ?? '', status: 'PENDING',
      submittedAt: timestamp, notes: data.additionalNotes, createdAt: timestamp, updatedAt: timestamp,
    };
    return toResponse(AdmissionRepository.save(record));
  }
  static updateStatus(id: string | number, request: AdmissionStatusUpdateRequest): AdmissionApplicationResponse {
    assertPermission(permissions.admissionsManage);
    const current = AdmissionRepository.findById(String(id));
    if (!current) throw new Error('Admission application not found');
    const status = displayStatus(current.status);
    const valid = (status === 'PENDING' && (request.status === 'UNDER_REVIEW' || request.status === 'APPROVED' || request.status === 'REJECTED')) ||
      (status === 'UNDER_REVIEW' && (request.status === 'APPROVED' || request.status === 'REJECTED'));
    if (!valid) throw new Error('Invalid admission status transition');
    const updated: AdmissionApplicationRecord = {
      ...current, status: request.status, updatedAt: new Date().toISOString(),
    };
    return toResponse(AdmissionRepository.save(updated));
  }
}
