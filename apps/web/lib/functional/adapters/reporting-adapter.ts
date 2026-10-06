import { isMockMode } from '../config';
import { apiClient } from '../../api/client';
import { 
  ReportTemplateRecord, 
  ReportTemplateCreateRequest, 
  ReportTemplateUpdateRequest 
} from '../types';

export class ReportingAdapter {
  // --- Templates ---
  static async getTemplates(): Promise<ReportTemplateRecord[]> {
    if (isMockMode) {
      return [];
    }
    return apiClient<ReportTemplateRecord[]>('/reporting/templates');
  }

  static async getTemplate(id: string): Promise<ReportTemplateRecord> {
    if (isMockMode) {
      throw new Error("Mock reporting templates not implemented yet.");
    }
    return apiClient<ReportTemplateRecord>(`/reporting/templates/${id}`);
  }

  static async createTemplate(input: ReportTemplateCreateRequest): Promise<ReportTemplateRecord> {
    if (isMockMode) {
      throw new Error("Mock reporting templates not implemented yet.");
    }
    return apiClient<ReportTemplateRecord>('/reporting/templates', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  static async updateTemplate(id: string, input: ReportTemplateUpdateRequest): Promise<ReportTemplateRecord> {
    if (isMockMode) {
      throw new Error("Mock reporting templates not implemented yet.");
    }
    return apiClient<ReportTemplateRecord>(`/reporting/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  }

  static async deleteTemplate(id: string): Promise<void> {
    if (isMockMode) {
      throw new Error("Mock reporting templates not implemented yet.");
    }
    return apiClient<void>(`/reporting/templates/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Generation ---
  static async generateReports(input: import('../types').ReportGenerationRequest): Promise<void> {
    if (isMockMode) {
      console.log('Mock generation requested:', input);
      return new Promise(resolve => setTimeout(resolve, 1500));
    }
    return apiClient<void>('/reporting/generation/bulk', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  // --- Snapshots ---
  static async getSnapshots(academicYearId: string, termId: string, classId: string): Promise<any[]> {
    if (isMockMode) {
      console.log('Mock getSnapshots requested:', { academicYearId, termId, classId });
      return [];
    }
    return apiClient<any[]>(`/reporting/snapshots?academicYearId=${academicYearId}&termId=${termId}&classId=${classId}`);
  }

  static async publishSnapshot(id: string): Promise<void> {
    if (isMockMode) {
      console.log('Mock publish requested:', id);
      return;
    }
    return apiClient<void>(`/reporting/snapshots/${id}/publish`, {
      method: 'POST'
    });
  }

  static async bulkPublishSnapshots(ids: string[]): Promise<void> {
    if (isMockMode) {
      console.log('Mock bulk publish requested:', ids);
      return;
    }
    return apiClient<void>('/reporting/snapshots/bulk-publish', {
      method: 'POST',
      body: JSON.stringify(ids)
    });
  }
}


