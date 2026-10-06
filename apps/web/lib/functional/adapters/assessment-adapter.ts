import { isMockMode } from '../config';
import { AssessmentService } from '../services/assessment-service';
import { AssessmentCreateRequest, AssessmentResultInput, AssessmentUpdateRequest, AssessmentRecord, AssessmentResultRecord } from '../types';
import { apiClient } from '../../api/client';

export class AssessmentAdapter {
  static async getAssessments(): Promise<AssessmentRecord[]> {
    if (isMockMode) {
      return AssessmentService.findAll();
    }
    return apiClient<AssessmentRecord[]>('/assessments');
  }

  static async getAssessment(id: string): Promise<AssessmentRecord> {
    if (isMockMode) {
      const assessment = AssessmentService.findById(id);
      if (!assessment) throw new Error("Assessment not found");
      return assessment;
    }
    return apiClient<AssessmentRecord>(`/assessments/${id}`);
  }

  static async createAssessment(input: AssessmentCreateRequest): Promise<AssessmentRecord> {
    if (isMockMode) {
      return AssessmentService.create(input);
    }
    return apiClient<AssessmentRecord>('/assessments', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  static async updateAssessment(id: string, input: AssessmentUpdateRequest): Promise<AssessmentRecord> {
    if (isMockMode) {
      return AssessmentService.update(id, input);
    }
    return apiClient<AssessmentRecord>(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
  }

  static async rejectAssessment(id: string, reason?: string): Promise<AssessmentRecord> {
    if (isMockMode) {
      return AssessmentService.reject(id, reason);
    }
    return apiClient<AssessmentRecord>(`/assessments/${id}/lifecycle/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  static async getAssessmentResults(id: string): Promise<AssessmentResultRecord[]> {
    if (isMockMode) {
      return AssessmentService.findResults(id);
    }
    return apiClient<AssessmentResultRecord[]>(`/assessments/${id}/results`);
  }

  static async saveAssessmentResult(id: string, input: AssessmentResultInput): Promise<AssessmentResultRecord> {
    if (isMockMode) {
      return AssessmentService.saveResult(id, input);
    }
    return apiClient<AssessmentResultRecord>(`/assessments/${id}/results`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  static async saveAssessmentResults(id: string, inputs: AssessmentResultInput[]): Promise<AssessmentResultRecord[]> {
    if (isMockMode) {
      return AssessmentService.saveResults(id, inputs);
    }
    return apiClient<AssessmentResultRecord[]>(`/assessments/${id}/results/batch`, {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  }

  static async finalizeAssessmentResults(id: string): Promise<AssessmentRecord> {
    if (isMockMode) {
      AssessmentService.finalizeResults(id);
      const assessment = AssessmentService.findById(id);
      if (!assessment) throw new Error("Assessment not found");
      return assessment;
    }
    return apiClient<AssessmentRecord>(`/assessments/${id}/lifecycle/submit`, {
      method: 'POST'
    });
  }

  static async previewAssessmentResults(id: string, inputs: AssessmentResultInput[]): Promise<Partial<AssessmentResultRecord>[]> {
    if (isMockMode) {
      return AssessmentService.previewResults(id, inputs) as Partial<AssessmentResultRecord>[];
    }
    return apiClient<Partial<AssessmentResultRecord>[]>(`/assessments/${id}/results/preview`, {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  }
}
