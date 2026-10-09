import { apiClient } from '@/lib/api/client';
import { isMockMode } from '../config';
import { GradingService } from '../services/grading-service';

export interface AssessmentPolicyResponse {
  id: string;
  schoolId: string;
  gradingSchemeId: string | null;
  gradingSchemeName: string | null;
  passMark: number;
  roundingRule: string;
}

export interface AssessmentPolicyUpdateRequest {
  gradingSchemeId: string;
  passMark: number;
  roundingRule: string;
}

export interface GradingSchemeResponse {
  id: string;
  name: string;
  description: string;
  sourceType: string;
  active: boolean;
}

export interface GradeBandResponse {
  id: string;
  schoolId: string;
  gradingSchemeId: string;
  grade: string;
  minimumScore: number;
  maximumScore: number;
  remark: string;
  sequence: number;
  isPass: boolean;
}

export interface GradeBandRequest {
  grade: string;
  minimumScore: number;
  maximumScore: number;
  remark: string;
  sequence: number;
  isPass: boolean;
}

export class GradingAdapter {
  static async getPolicy(): Promise<AssessmentPolicyResponse> {
    if (isMockMode) throw new Error("Mock not supported for policy");
    return apiClient<AssessmentPolicyResponse>('/assessment-policy');
  }

  static async updatePolicy(request: AssessmentPolicyUpdateRequest): Promise<AssessmentPolicyResponse> {
    if (isMockMode) throw new Error("Mock not supported for policy");
    return apiClient<AssessmentPolicyResponse>('/assessment-policy', {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  static async getSchemes(): Promise<GradingSchemeResponse[]> {
    if (isMockMode) throw new Error("Mock not supported for schemes");
    return apiClient<GradingSchemeResponse[]>('/grading-schemes');
  }

  static async createScheme(name: string, description: string): Promise<GradingSchemeResponse> {
    if (isMockMode) throw new Error("Mock not supported for schemes");
    return apiClient<GradingSchemeResponse>('/grading-schemes', {
      method: 'POST',
      body: JSON.stringify({ name, description, sourceType: 'CUSTOM' })
    });
  }

  static async getBands(schemeId: string): Promise<GradeBandResponse[]> {
    if (isMockMode) throw new Error("Mock not supported for bands");
    return apiClient<GradeBandResponse[]>(`/grading-schemes/${schemeId}/bands`);
  }

  static async createBand(schemeId: string, request: GradeBandRequest): Promise<GradeBandResponse> {
    if (isMockMode) throw new Error("Mock not supported for bands");
    return apiClient<GradeBandResponse>(`/grading-schemes/${schemeId}/bands`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  static async updateBand(schemeId: string, bandId: string, request: GradeBandRequest): Promise<GradeBandResponse> {
    if (isMockMode) throw new Error("Mock not supported for bands");
    return apiClient<GradeBandResponse>(`/grading-schemes/${schemeId}/bands/${bandId}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  static async deleteBand(schemeId: string, bandId: string): Promise<void> {
    if (isMockMode) throw new Error("Mock not supported for bands");
    return apiClient<void>(`/grading-schemes/${schemeId}/bands/${bandId}`, {
      method: 'DELETE'
    });
  }

  static async getCategories() { 
    return apiClient<any[]>('/assessment-categories');
  }

  static async createCategory(name: string) { 
    return apiClient<any>('/assessment-categories', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  }
}
