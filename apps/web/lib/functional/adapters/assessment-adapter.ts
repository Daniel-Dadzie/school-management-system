import { isMockMode } from '../config';
import { AssessmentService } from '../services/assessment-service';
import { AssessmentCreateRequest, AssessmentResultInput, AssessmentUpdateRequest } from '../types';

const requireMockImplementation = (): void => {
  if (!isMockMode) {
    throw new Error('Assessment API integration is not available yet.');
  }
};

export class AssessmentAdapter {
  static async getAssessments() {
    requireMockImplementation();
    return AssessmentService.findAll();
  }

  static async getAssessment(id: string) {
    requireMockImplementation();
    return AssessmentService.findById(id);
  }

  static async createAssessment(input: AssessmentCreateRequest) {
    requireMockImplementation();
    return AssessmentService.create(input);
  }

  static async updateAssessment(id: string, input: AssessmentUpdateRequest) {
    requireMockImplementation();
    return AssessmentService.update(id, input);
  }

  static async rejectAssessment(id: string, reason?: string) {
    requireMockImplementation();
    return AssessmentService.reject(id, reason);
  }

  static async getAssessmentResults(id: string) {
    requireMockImplementation();
    return AssessmentService.findResults(id);
  }

  static async saveAssessmentResult(id: string, input: AssessmentResultInput) {
    requireMockImplementation();
    return AssessmentService.saveResult(id, input);
  }

  static async saveAssessmentResults(id: string, inputs: AssessmentResultInput[]) {
    requireMockImplementation();
    return AssessmentService.saveResults(id, inputs);
  }

  static async finalizeAssessmentResults(id: string) {
    requireMockImplementation();
    return AssessmentService.finalizeResults(id);
  }

  static async previewAssessmentResults(id: string, inputs: AssessmentResultInput[]) {
    requireMockImplementation();
    return AssessmentService.previewResults(id, inputs);
  }
}
