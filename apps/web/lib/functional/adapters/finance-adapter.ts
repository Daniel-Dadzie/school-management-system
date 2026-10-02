import { isMockMode } from '../config';
import { FinanceService } from '../services/finance-service';

const mockOnly = () => { if (!isMockMode) throw new Error('Finance operations are available in Functional Mock Mode only.'); };
export class FinanceAdapter {
  static references() { mockOnly(); return FinanceService.references(); }
  static invoices() { mockOnly(); return FinanceService.invoices(); }
  static payments() { mockOnly(); return FinanceService.payments(); }
  static dashboard() { mockOnly(); return FinanceService.dashboard(); }
  static studentFees(id: string) { mockOnly(); return FinanceService.studentFees(id); }
  static statement(id: string) { mockOnly(); return FinanceService.statement(id); }
  static createPaymentPlan(input: Parameters<typeof FinanceService.createPaymentPlan>[0]) { mockOnly(); return FinanceService.createPaymentPlan(input); }
  static addAdjustment(input: Parameters<typeof FinanceService.addAdjustment>[0]) { mockOnly(); return FinanceService.addAdjustment(input); }
  static reconcile(input: Parameters<typeof FinanceService.reconcile>[0]) { mockOnly(); return FinanceService.reconcile(input); }
  static createStructure(input: Parameters<typeof FinanceService.createStructure>[0]) { mockOnly(); return FinanceService.createStructure(input); }
  static createInvoice(input: Parameters<typeof FinanceService.createInvoice>[0]) { mockOnly(); return FinanceService.createInvoice(input); }
  static recordPayment(input: Parameters<typeof FinanceService.recordPayment>[0]) { mockOnly(); return FinanceService.recordPayment(input); }
  static voidInvoice(id: string, reason: string) { mockOnly(); return FinanceService.voidInvoice(id, reason); }
  static receipt(id: string) { mockOnly(); return FinanceService.receipt(id); }
}
