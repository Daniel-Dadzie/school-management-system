import { isMockMode } from '../config';
import { GradingService } from '../services/grading-service';

const requireMockImplementation = () => { if (!isMockMode) throw new Error('Grading API integration is not available yet.'); };
export class GradingAdapter {
  static async getCategories() { requireMockImplementation(); return GradingService.categories(); }
  static async getScales() { requireMockImplementation(); return GradingService.scales(); }
  static async createCategory(name: string) { requireMockImplementation(); return GradingService.createCategory(name); }
  static async saveScale(input: Parameters<typeof GradingService.saveScale>[0]) { requireMockImplementation(); return GradingService.saveScale(input); }
}
