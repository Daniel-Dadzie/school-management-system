import { isMockMode } from '../config';
import { FinanceService } from '../services/finance-service';
import { postPayment, fetchStudentInvoices, fetchStudentPayments } from '../../api/finance';

const mockOnly = () => { if (!isMockMode) throw new Error('Finance operations are available in Functional Mock Mode only.'); };
export class FinanceAdapter {

  static walletDashboard() { mockOnly(); return FinanceService.walletDashboard(); }
  static fundWalletAndDistribute(input: Parameters<typeof FinanceService.fundWalletAndDistribute>[0]) { mockOnly(); return FinanceService.fundWalletAndDistribute(input); }
  static references() { mockOnly(); return FinanceService.references(); }
  static invoices() { mockOnly(); return FinanceService.invoices(); }
  static payments() { mockOnly(); return FinanceService.payments(); }
  static dashboard() { mockOnly(); return FinanceService.dashboard(); }
  static async studentFees(id: string) { 
    if (isMockMode) return FinanceService.studentFees(id); 
    
    const [invoicesData, paymentsData] = await Promise.all([
      fetchStudentInvoices(id),
      fetchStudentPayments(id)
    ]) as [any[], any[]];

    const invoices = invoicesData.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      studentId: inv.studentId,
      tenantId: 'real-tenant',
      enrollmentId: 'N/A',
      academicYearId: 'N/A',
      termId: 'N/A',
      feeStructureId: 'N/A',
      issuedOn: inv.issueDate,
      dueOn: inv.dueDate,
      status: inv.status,
      studentName: inv.studentName,
      className: '',
      yearName: inv.yearName,
      termName: inv.termName,
      lineItems: inv.lineItems.map((li: any) => ({
        id: li.id,
        invoiceId: inv.id,
        tenantId: 'real-tenant',
        description: li.description,
        amountMinor: Math.round(li.amount * 100)
      })),
      adjustments: [],
      baseTotalMinor: Math.round(inv.totalAmount * 100),
      adjustmentMinor: 0,
      totalMinor: Math.round(inv.totalAmount * 100),
      paidMinor: Math.round(inv.paidAmount * 100),
      outstandingMinor: Math.round(inv.outstandingAmount * 100)
    }));

    const payments = paymentsData.map((pay: any) => ({
      id: pay.id,
      tenantId: 'real-tenant',
      receiptNumber: pay.receiptNumber,
      reference: pay.reference,
      invoiceId: 'N/A',
      studentId: pay.studentId,
      amountMinor: Math.round(pay.amount * 100),
      paymentDate: pay.paymentDate,
      method: pay.method,
      status: pay.status,
      recordedBy: 'N/A',
      channel: 'PARENT',
      createdAt: pay.paymentDate
    }));

    const studentNameParts = (invoices[0]?.studentName || 'Student Name').split(' ');

    return {
      student: {
        id,
        tenantId: 'real-tenant',
        firstName: studentNameParts[0],
        lastName: studentNameParts.slice(1).join(' ') || '',
        guardianId: 'N/A',
        enrollmentDate: 'N/A'
      },
      invoices,
      payments,
      plans: [],
      installments: [],
      adjustments: [],
      summary: {
        totalBilledMinor: invoices.reduce((sum: number, inv: any) => sum + inv.totalMinor, 0),
        totalPaidMinor: payments.reduce((sum: number, pay: any) => sum + pay.amountMinor, 0),
        outstandingMinor: invoices.reduce((sum: number, inv: any) => sum + inv.outstandingMinor, 0),
        nextDueOn: invoices.filter((i: any) => i.outstandingMinor > 0).sort((a: any, b: any) => a.dueOn.localeCompare(b.dueOn))[0]?.dueOn,
        nextDueMinor: invoices.filter((i: any) => i.outstandingMinor > 0).sort((a: any, b: any) => a.dueOn.localeCompare(b.dueOn))[0]?.outstandingMinor
      }
    };
  }
  static async statement(id: string) { 
    if (isMockMode) return FinanceService.statement(id); 

    const [invoicesData, paymentsData] = await Promise.all([
      fetchStudentInvoices(id),
      fetchStudentPayments(id)
    ]) as [any[], any[]];

    const entries = [
      ...invoicesData.map((inv: any) => ({
        date: inv.issueDate,
        type: 'CHARGE' as const,
        description: inv.invoiceNumber,
        amountMinor: Math.round(inv.totalAmount * 100)
      })),
      ...paymentsData.map((pay: any) => ({
        date: pay.paymentDate,
        type: 'PAYMENT' as const,
        description: pay.receiptNumber || pay.reference,
        amountMinor: -Math.round(pay.amount * 100)
      }))
    ].sort((a, b) => b.date.localeCompare(a.date));

    const studentNameParts = (invoicesData[0]?.studentName || 'Student Name').split(' ');

    return {
      student: {
        id,
        tenantId: 'real-tenant',
        firstName: studentNameParts[0],
        lastName: studentNameParts.slice(1).join(' ') || '',
        guardianId: 'N/A',
        enrollmentDate: 'N/A'
      },
      entries,
      balanceMinor: entries.reduce((sum, entry) => sum + entry.amountMinor, 0)
    };
  }
  static createPaymentPlan(input: Parameters<typeof FinanceService.createPaymentPlan>[0]) { mockOnly(); return FinanceService.createPaymentPlan(input); }
  static addAdjustment(input: Parameters<typeof FinanceService.addAdjustment>[0]) { mockOnly(); return FinanceService.addAdjustment(input); }
  static reconcile(input: Parameters<typeof FinanceService.reconcile>[0]) { mockOnly(); return FinanceService.reconcile(input); }
  static createStructure(input: Parameters<typeof FinanceService.createStructure>[0]) { mockOnly(); return FinanceService.createStructure(input); }
  static createInvoice(input: Parameters<typeof FinanceService.createInvoice>[0]) { mockOnly(); return FinanceService.createInvoice(input); }
  static recordPayment(input: Parameters<typeof FinanceService.recordPayment>[0] & { studentId?: string }) { 
    if (isMockMode) return FinanceService.recordPayment(input); 
    if (!input.studentId) throw new Error('studentId is required for API mode');
    return postPayment(input.studentId, {
      amount: input.amountMinor / 100,
      paymentMethod: input.method,
      reference: `PAY-${Date.now()}`
    });
  }
  static voidInvoice(id: string, reason: string) { mockOnly(); return FinanceService.voidInvoice(id, reason); }
  static receipt(id: string) { mockOnly(); return FinanceService.receipt(id); }
}
