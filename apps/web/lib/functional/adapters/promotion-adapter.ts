import { isMockMode } from '../config';
import { PromotionService } from '../services/promotion-service';
import { apiClient } from '@/lib/api/client';
import { AcademicAdapter } from './academic-adapter';

export class PromotionAdapter {
  static async getReferences() {
    if (!isMockMode) {
        // Fetch academic years and classes
        const [years, classes] = await Promise.all([
            AcademicAdapter.getAcademicYears(),
            AcademicAdapter.getSchoolClasses()
        ]);
        return {
            academicYears: years,
            classes: classes
        };
    }
    return PromotionService.references();
  }

  static async getWorkspace(academicYearId: string, sourceClassId: string) {
    if (!isMockMode) {
      const [years, classes] = await Promise.all([
          AcademicAdapter.getAcademicYears(),
          AcademicAdapter.getSchoolClasses()
      ]);
      const tenantYears = years.slice().sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));
      const sourceYearIndex = tenantYears.findIndex((year: any) => year.id === academicYearId);
      const destinationYear = tenantYears[sourceYearIndex + 1];

      // Fetch terms for the academic year to get the last term
      const terms = await AcademicAdapter.getTerms(academicYearId);
      const sortedTerms = terms.sort((a, b) => b.endDate.localeCompare(a.endDate));
      const lastTerm = sortedTerms[0];

      let candidates = [];
      if (lastTerm) {
         candidates = await apiClient<any[]>('/api/v1/academic/promotions/candidates', {
             method: 'GET',
             params: { academicYearId, termId: lastTerm.id, classId: sourceClassId }
         });
      }

      // Map backend candidates to frontend Candidate type
      const mappedCandidates = candidates.map((c: any) => ({
          studentId: c.studentId,
          studentName: c.studentName,
          admissionNumber: c.admissionNumber || '',
          sourceEnrollmentId: c.sourceEnrollmentId || '', // Backend should ideally return this
          alreadyEnrolled: false, // Backend handles conflict
          academicSummary: c.overallScore != null ? {
             termName: lastTerm.name,
             averagePercentage: c.overallScore,
             completedSubjects: 0,
             subjects: [],
             attendance: { present: 0, absent: 0, late: 0, total: 0 }
          } : undefined
      }));

      return {
          academicYears: tenantYears,
          classes: classes,
          sourceClassId,
          destinationAcademicYearId: destinationYear?.id,
          candidates: mappedCandidates
      };
    }
    return PromotionService.workspace(academicYearId, sourceClassId);
  }

  static getHistory(studentId: string) {
    if (!isMockMode) throw new Error('Academic history is available in Functional Mock Mode only.');
    return PromotionService.history(studentId);
  }

  static async initiate(input: { sourceAcademicYearId: string; sourceClassId: string; records: Parameters<typeof PromotionService.confirm>[0]['records'] }) {
    if (!isMockMode) {
        // Just return to indicate review can start
        return;
    }
    return PromotionService.initiate(input);
  }

  static async confirm(input: Parameters<typeof PromotionService.confirm>[0]) {
    if (!isMockMode) {
        // We assume all selected records are going to the same destinationClassId and destinationYear for simplicity,
        // or we need to group them. The UI supports different destinations per student, but backend PromotionRequestDTO only takes single targetClassId.
        // Let's modify the payload to map each distinct targetClassId to a separate API call.
        const byClass = new Map<string, string[]>();
        for (const record of input.records) {
            if (record.decision === 'PROMOTE' || record.decision === 'RETAIN') {
               const list = byClass.get(record.destinationClassId) || [];
               list.push(record.studentId);
               byClass.set(record.destinationClassId, list);
            }
        }
        
        // Find destination year
        const years = await AcademicAdapter.getAcademicYears();
        const tenantYears = years.slice().sort((a: any, b: any) => a.startDate.localeCompare(b.startDate));
        const sourceYearIndex = tenantYears.findIndex((year: any) => year.id === input.sourceAcademicYearId);
        const destinationYear = tenantYears[sourceYearIndex + 1];
        
        if (!destinationYear) throw new Error("Destination year not found");

        const promises = Array.from(byClass.entries()).map(([targetClassId, studentIds]) => {
            return apiClient('/api/v1/academic/promotions/bulk', {
                method: 'POST',
                body: JSON.stringify({
                    sourceAcademicYearId: input.sourceAcademicYearId,
                    sourceClassId: input.sourceClassId,
                    targetAcademicYearId: destinationYear.id,
                    targetClassId: targetClassId,
                    studentIds: studentIds
                })
            });
        });

        await Promise.all(promises);
        return [];
    }
    return PromotionService.confirm(input);
  }
}
