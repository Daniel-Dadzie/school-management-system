import { isMockMode } from '../config';
import { PromotionService } from '../services/promotion-service';

export class PromotionAdapter {
  static getReferences() {
    if (!isMockMode) throw new Error('Promotions are available in Functional Mock Mode only.');
    return PromotionService.references();
  }

  static getWorkspace(academicYearId: string, sourceClassId: string) {
    if (!isMockMode) throw new Error('Promotions are available in Functional Mock Mode only.');
    return PromotionService.workspace(academicYearId, sourceClassId);
  }

  static getHistory(studentId: string) {
    if (!isMockMode) throw new Error('Academic history is available in Functional Mock Mode only.');
    return PromotionService.history(studentId);
  }

  static initiate(input: { sourceAcademicYearId: string; sourceClassId: string; records: Parameters<typeof PromotionService.confirm>[0]['records'] }) {
    if (!isMockMode) throw new Error('Promotions are available in Functional Mock Mode only.');
    return PromotionService.initiate(input);
  }

  static confirm(input: Parameters<typeof PromotionService.confirm>[0]) {
    if (!isMockMode) throw new Error('Promotions are available in Functional Mock Mode only.');
    return PromotionService.confirm(input);
  }
}
