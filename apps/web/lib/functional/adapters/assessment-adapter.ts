import { AssessmentCreateRequest, AssessmentResultInput, AssessmentUpdateRequest, AssessmentRecord, AssessmentResultRecord } from '../types';
import { apiClient } from '../../api/client';

export class AssessmentAdapter {
  static async getAssessments(): Promise<AssessmentRecord[]> {
    return apiClient<AssessmentRecord[]>('/assessments');
  }

  static async getAssessment(id: string): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}`);
  }

  static async createAssessment(input: AssessmentCreateRequest): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>('/assessments', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  static async updateAssessment(id: string, input: AssessmentUpdateRequest): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  }

  static async rejectAssessment(id: string, reason?: string): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  static async getAssessmentResults(id: string): Promise<AssessmentResultRecord[]> {
    return apiClient<AssessmentResultRecord[]>(`/assessments/${id}/results`);
  }

  static async saveAssessmentResult(id: string, input: AssessmentResultInput): Promise<AssessmentResultRecord> {
    return apiClient<AssessmentResultRecord>(`/assessments/${id}/results`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  static async saveAssessmentResults(id: string, inputs: AssessmentResultInput[]): Promise<AssessmentResultRecord[]> {
    return apiClient<AssessmentResultRecord[]>(`/assessments/${id}/results`, {
      method: 'PUT',
      body: JSON.stringify({ results: inputs })
    });
  }

  static async submitAssessment(id: string): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}/submit`, {
      method: 'POST'
    });
  }

  static async approveAssessment(id: string): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}/approve`, {
      method: 'POST'
    });
  }

  static async publishAssessment(id: string): Promise<AssessmentRecord> {
    return apiClient<AssessmentRecord>(`/assessments/${id}/publish`, {
      method: 'POST'
    });
  }

  static async finalizeAssessmentResults(id: string): Promise<AssessmentRecord> {
    // Alias for submitAssessment to maintain compatibility
    return this.submitAssessment(id);
  }

  static async previewAssessmentResults(id: string, inputs: AssessmentResultInput[]): Promise<Partial<AssessmentResultRecord>[]> {
    return apiClient<Partial<AssessmentResultRecord>[]>(`/assessments/${id}/results/preview`, {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  }
}
