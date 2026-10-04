import { isMockMode } from '../config';
import { admissionsApi, AdmissionApplicationRequest, AdmissionStatusUpdateRequest } from '../../api/admissions';
import { AdmissionService } from '../services/admission-service';

export class AdmissionAdapter {
  static getApplications() { return isMockMode ? Promise.resolve(AdmissionService.list()) : admissionsApi.getApplications(); }
  static getApplication(id: string | number) { return isMockMode ? Promise.resolve(AdmissionService.get(id)).then((application) => {
    if (!application) throw new Error('Admission application not found'); return application;
  }) : admissionsApi.getApplication(id); }
  static updateStatus(id: string | number, data: AdmissionStatusUpdateRequest) { return isMockMode ? Promise.resolve(AdmissionService.updateStatus(id, data)) : admissionsApi.updateStatus(id, data); }
  static apply(data: AdmissionApplicationRequest, schoolSlug: string) { return isMockMode ? Promise.resolve(AdmissionService.submit(data)) : admissionsApi.apply(data, schoolSlug); }
}
