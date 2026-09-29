import { isMockMode } from '../config';
import { FinanceService } from '../services/finance-service';

const mockOnly = () => { if (!isMockMode) throw new Error('Finance operations are available in Functional Mock Mode only.'); };
export class FinanceAdapter {
  static references() { mockOnly(); return FinanceService.references(); }
  static invoices() { mockOnly(); return FinanceService.invoices(); }
  static payments() { mockOnly(); return FinanceService.payments(); }
  static dashboard() { mockOnly(); return FinanceService.dashboard(); }
  static studentFees(id: string) { mockOnly(); return FinanceService.studentFees(id); }
  static createStructure(input: Parameters<typeof FinanceService.createStructure>[0]) { mockOnly(); return FinanceService.createStructure(input); }
  static createInvoice(input: Parameters<typeof FinanceService.createInvoice>[0]) { mockOnly(); return FinanceService.createInvoice(input); }
  static recordPayment(input: Parameters<typeof FinanceService.recordPayment>[0]) { mockOnly(); return FinanceService.recordPayment(input); }
  static voidInvoice(id: string, reason: string) { mockOnly(); return FinanceService.voidInvoice(id, reason); }
  static receipt(id: string) { mockOnly(); return FinanceService.receipt(id); }
}
