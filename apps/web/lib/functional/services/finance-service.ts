import { useAuthStore } from '@/stores/auth-store';
import { assertPermission, AuthorizationError, permissions } from '@/lib/authorization/permissions';
import { FinanceRepository } from '../repositories/finance-repository';
import type { FeeAdjustmentType, InvoiceStatus, PaymentMethod, PaymentPlanCadence } from '../types';

const actor = () => { const user = useAuthStore.getState().user; if (!user || !user.tenantId) throw new AuthorizationError(); return { ...user, tenantId: user.tenantId as string }; };
const audit = (store: ReturnType<typeof FinanceRepository.read>, userId: string, tenantId: string, action: 'CREATE' | 'UPDATE', entityType: string, entityId: string, details: Record<string, unknown>) => store.auditEvents.push({ id: `audit-${globalThis.crypto.randomUUID()}`, tenantId, userId, action, entityType, entityId, details: JSON.stringify(details), createdAt: new Date().toISOString() });
const nextCode = (prefix: string, rows: object[], field: string, year = new Date().getFullYear()) => `${prefix}-${year}-${String(rows.filter((row) => String((row as Record<string, unknown>)[field]).startsWith(`${prefix}-${year}-`)).length + 1).padStart(6, '0')}`;
const invoiceAmount = (store: ReturnType<typeof FinanceRepository.read>, invoiceId: string) => store.invoiceLineItems.filter((row) => row.invoiceId === invoiceId).reduce((sum, row) => sum + row.amountMinor, 0);
const paidAmount = (store: ReturnType<typeof FinanceRepository.read>, invoiceId: string) => store.payments.filter((row) => row.invoiceId === invoiceId && row.status === 'RECORDED').reduce((sum, row) => sum + row.amountMinor, 0);
const adjustmentAmount = (store: ReturnType<typeof FinanceRepository.read>, invoiceId: string) => store.feeAdjustments.filter((row) => row.invoiceId === invoiceId).reduce((sum, row) => sum + row.amountMinor, 0);
const invoiceStatus = (store: ReturnType<typeof FinanceRepository.read>, invoice: ReturnType<typeof FinanceRepository.read>['invoices'][number]): InvoiceStatus => {
  if (invoice.voidedAt) return 'VOID';
  const total = Math.max(invoiceAmount(store, invoice.id) - adjustmentAmount(store, invoice.id), 0); const paid = paidAmount(store, invoice.id);
  if (paid >= total) return 'PAID'; if (paid > 0) return 'PARTIALLY_PAID'; return invoice.dueOn < new Date().toISOString().slice(0, 10) ? 'OVERDUE' : 'ISSUED';
};
const viewInvoice = (store: ReturnType<typeof FinanceRepository.read>, invoice: ReturnType<typeof FinanceRepository.read>['invoices'][number]) => {
  const student = store.students.find((row) => row.id === invoice.studentId && row.tenantId === invoice.tenantId);
  const schoolClass = store.classes.find((row) => row.id === store.enrollments.find((entry) => entry.id === invoice.enrollmentId)?.schoolClassId);
  const year = store.academicYears.find((row) => row.id === invoice.academicYearId); const term = store.terms.find((row) => row.id === invoice.termId);
  const baseTotalMinor = invoiceAmount(store, invoice.id); const adjustmentMinor = adjustmentAmount(store, invoice.id); const totalMinor = Math.max(baseTotalMinor - adjustmentMinor, 0); const paidMinor = paidAmount(store, invoice.id);
  return { ...invoice, studentName: student ? `${student.firstName} ${student.lastName}` : 'Student unavailable', className: schoolClass?.name ?? 'Class unavailable', yearName: year?.name ?? '', termName: term?.name ?? '', lineItems: store.invoiceLineItems.filter((row) => row.invoiceId === invoice.id), adjustments: store.feeAdjustments.filter((row) => row.invoiceId === invoice.id), baseTotalMinor, adjustmentMinor, totalMinor, paidMinor, outstandingMinor: Math.max(totalMinor - paidMinor, 0), status: invoiceStatus(store, invoice) };
};
const addMonths = (date: string, months: number) => { const value = new Date(`${date}T00:00:00Z`); value.setUTCMonth(value.getUTCMonth() + months); return value.toISOString().slice(0, 10); };
const notify = (store: ReturnType<typeof FinanceRepository.read>, userId: string, tenantId: string, title: string, message: string, link?: string) => { if (store.notifications.some((item) => item.userId === userId && item.title === title && item.message === message)) return; store.notifications.push({ id: `notif-${globalThis.crypto.randomUUID()}`, tenantId, userId, title, message, status: 'UNREAD', createdAt: new Date().toISOString(), link }); };

export class FinanceService {

  static walletDashboard() {
    const user = actor();
    if (user.role !== 'PARENT') throw new Error('Only parents can access the family wallet.');
    const store = FinanceRepository.read();
    let wallet = store.familyWallets.find(w => w.parentId === user.id && w.tenantId === user.tenantId);
    if (!wallet) {
      wallet = { id: 'wallet-' + globalThis.crypto.randomUUID(), tenantId: user.tenantId, parentId: user.id, balanceMinor: 0, updatedAt: new Date().toISOString() };
      store.familyWallets.push(wallet);
      FinanceRepository.save(store);
    }
    const transactions = store.familyWalletTransactions.filter(t => t.parentId === user.id && t.tenantId === user.tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { wallet, transactions };
  }

  static fundWalletAndDistribute(input: { amountMinor: number; method: PaymentMethod }) {
    const user = actor();
    if (user.role !== 'PARENT') throw new Error('Only parents can fund the family wallet.');
    if (!['CARD', 'MOBILE_MONEY'].includes(input.method)) throw new Error('Parents can only fund via card or mobile money.');
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) throw new Error('Amount must be positive.');
    
    const store = FinanceRepository.read();
    let wallet = store.familyWallets.find(w => w.parentId === user.id && w.tenantId === user.tenantId);
    if (!wallet) {
      wallet = { id: 'wallet-' + globalThis.crypto.randomUUID(), tenantId: user.tenantId, parentId: user.id, balanceMinor: 0, updatedAt: new Date().toISOString() };
      store.familyWallets.push(wallet);
    }
    
    wallet.balanceMinor += input.amountMinor;
    wallet.updatedAt = new Date().toISOString();
    store.familyWalletTransactions.push({
      id: 'tx-' + globalThis.crypto.randomUUID(),
      tenantId: user.tenantId,
      parentId: user.id,
      amountMinor: input.amountMinor,
      type: 'DEPOSIT',
      reference: 'DEP-' + Date.now(),
      description: 'Wallet top-up via ' + input.method.replace('_', ' '),
      createdAt: new Date().toISOString()
    });

    const children = store.students.filter(s => s.guardianId === user.id && s.tenantId === user.tenantId);
    const childIds = children.map(c => c.id);
    const allInvoices = store.invoices
      .filter(i => childIds.includes(i.studentId) && i.tenantId === user.tenantId)
      .map(i => viewInvoice(store, i))
      .filter(i => i.status !== 'VOID' && i.outstandingMinor > 0)
      .sort((a, b) => a.dueOn.localeCompare(b.dueOn));

    const today = new Date().toISOString().slice(0, 10);
    const year = Number(today.slice(0, 4));

    for (const invoice of allInvoices) {
      if (wallet.balanceMinor <= 0) break;
      
      const paymentAmount = Math.min(wallet.balanceMinor, invoice.outstandingMinor);
      wallet.balanceMinor -= paymentAmount;
      wallet.updatedAt = new Date().toISOString();

      const receiptNumber = nextCode('RCPT', store.payments.filter((p) => p.tenantId === user.tenantId), 'receiptNumber', year); 
      const reference = nextCode('PAY', store.payments.filter((p) => p.tenantId === user.tenantId), 'reference', year); 
      const paymentId = 'payment-' + globalThis.crypto.randomUUID();
      
      store.payments.push({ 
        id: paymentId, 
        tenantId: user.tenantId, 
        receiptNumber, 
        reference, 
        invoiceId: invoice.id, 
        studentId: invoice.studentId, 
        amountMinor: paymentAmount, 
        paymentDate: today, 
        method: 'WALLET' as PaymentMethod, 
        status: 'RECORDED', 
        recordedBy: user.id, 
        channel: 'PARENT', 
        notes: 'Auto-distributed from Family Wallet', 
        createdAt: new Date().toISOString() 
      });

      store.familyWalletTransactions.push({
        id: 'tx-' + globalThis.crypto.randomUUID(),
        tenantId: user.tenantId,
        parentId: user.id,
        amountMinor: paymentAmount,
        type: 'WITHDRAWAL',
        reference: receiptNumber,
        description: 'Auto-payment for Invoice ' + invoice.invoiceNumber,
        createdAt: new Date().toISOString()
      });

      notify(store, user.id, user.tenantId, 'Wallet payment applied: ' + receiptNumber, 'Paid ' + paymentAmount + ' towards invoice ' + invoice.invoiceNumber + '.', '/parent-children/' + invoice.studentId + '/fees/receipts/' + paymentId);
    }

    FinanceRepository.save(store);
  }
  static references() {
    const user = actor(); assertPermission(permissions.financeView); const store = FinanceRepository.read();
    return { years: store.academicYears.filter((r) => r.tenantId === user.tenantId), terms: store.terms.filter((r) => r.tenantId === user.tenantId), classes: store.classes.filter((r) => r.tenantId === user.tenantId), students: store.students.filter((r) => r.tenantId === user.tenantId), structures: store.feeStructures.filter((r) => r.tenantId === user.tenantId).map((structure) => ({ ...structure, items: store.feeItems.filter((item) => item.feeStructureId === structure.id) })) };
  }
  static invoices() { const user = actor(); assertPermission(permissions.financeView); const store = FinanceRepository.read(); return store.invoices.filter((row) => row.tenantId === user.tenantId).map((row) => viewInvoice(store, row)).sort((a, b) => b.issuedOn.localeCompare(a.issuedOn)); }
  static payments() { const user = actor(); assertPermission(permissions.financeView); const store = FinanceRepository.read(); return store.payments.filter((row) => row.tenantId === user.tenantId).map((row) => ({ ...row, invoiceNumber: store.invoices.find((i) => i.id === row.invoiceId)?.invoiceNumber ?? 'Invoice unavailable', studentName: store.students.find((s) => s.id === row.studentId)?.firstName + ' ' + (store.students.find((s) => s.id === row.studentId)?.lastName ?? '') })); }
  static dashboard() { const user = actor(); const invoices = this.invoices(); const payments = this.payments(); const recordedPayments = payments.filter((p) => p.status === 'RECORDED'); const totalInvoicedMinor = invoices.filter((i) => i.status !== 'VOID').reduce((n, i) => n + i.totalMinor, 0); const totalCollectedMinor = recordedPayments.reduce((n, p) => n + p.amountMinor, 0); const paymentMethodTotals = recordedPayments.reduce<Record<PaymentMethod, number>>((totals, payment) => ({ ...totals, [payment.method]: totals[payment.method] + payment.amountMinor }), { CASH: 0, BANK_TRANSFER: 0, MOBILE_MONEY: 0, CARD: 0, WALLET: 0 }); const overdueByClass = invoices.filter((i) => i.status === 'OVERDUE').reduce<Record<string, number>>((totals, invoice) => ({ ...totals, [invoice.className]: (totals[invoice.className] ?? 0) + invoice.outstandingMinor }), {}); const store = FinanceRepository.read(); return { totalInvoicedMinor, totalCollectedMinor, outstandingMinor: invoices.filter((i) => i.status !== 'VOID').reduce((n, i) => n + i.outstandingMinor, 0), overdueMinor: invoices.filter((i) => i.status === 'OVERDUE').reduce((n, i) => n + i.outstandingMinor, 0), collectionRate: totalInvoicedMinor ? Math.round(totalCollectedMinor / totalInvoicedMinor * 10000) / 100 : 0, paymentMethodTotals, overdueByClass, invoiceCount: invoices.length, paymentCount: recordedPayments.length, invoices, reconciliation: this.reconciliationSummary(user.tenantId, store) }; }
  static studentFees(studentId: string) { const user = actor(); const parent = user.role === 'PARENT'; assertPermission(parent ? permissions.parentFeesView : permissions.financeView); const store = FinanceRepository.read(); const student = store.students.find((s) => s.id === studentId && s.tenantId === user.tenantId && (!parent || s.guardianId === user.id)); if (!student) throw new Error('Student finance record not found.'); const invoices = store.invoices.filter((i) => i.tenantId === user.tenantId && i.studentId === studentId).map((i) => viewInvoice(store, i)); const payments = store.payments.filter((p) => p.tenantId === user.tenantId && p.studentId === studentId && p.status === 'RECORDED'); const nextDue = invoices.filter((invoice) => invoice.outstandingMinor > 0).sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0]; if (parent) invoices.filter((invoice) => invoice.status === 'OVERDUE').forEach((invoice) => notify(store, user.id, user.tenantId, `Overdue fee: ${invoice.invoiceNumber}`, `Payment of ${invoice.outstandingMinor} remains outstanding.`, `/parent-children/${studentId}/fees`)); FinanceRepository.save(store); return { student, invoices, payments, plans: store.paymentPlans.filter((plan) => plan.studentId === studentId && plan.tenantId === user.tenantId), installments: store.paymentInstallments.filter((installment) => installment.tenantId === user.tenantId && installment.invoiceId && invoices.some((invoice) => invoice.id === installment.invoiceId)), adjustments: store.feeAdjustments.filter((adjustment) => adjustment.studentId === studentId && adjustment.tenantId === user.tenantId), summary: { totalBilledMinor: invoices.reduce((sum, invoice) => sum + invoice.totalMinor, 0), totalPaidMinor: payments.reduce((sum, payment) => sum + payment.amountMinor, 0), outstandingMinor: invoices.reduce((sum, invoice) => sum + invoice.outstandingMinor, 0), nextDueOn: nextDue?.dueOn, nextDueMinor: nextDue?.outstandingMinor } }; }
  static createStructure(input: { name: string; academicYearId: string; termId: string; schoolClassId: string; items: { name: string; description?: string; amountMinor: number }[] }) {
    const user = actor(); assertPermission(permissions.financeManage); const name = input.name.trim();
    if (!name || !input.items.length || input.items.some((i) => !i.name.trim() || !Number.isSafeInteger(i.amountMinor) || i.amountMinor <= 0) || new Set(input.items.map((i) => i.name.trim().toLowerCase())).size !== input.items.length) throw new Error('Enter a name and fee items with unique names and positive amounts.');
    const store = FinanceRepository.read(); const year = store.academicYears.find((r) => r.id === input.academicYearId && r.tenantId === user.tenantId); const term = store.terms.find((r) => r.id === input.termId && r.tenantId === user.tenantId && r.academicYearId === input.academicYearId); const schoolClass = store.classes.find((r) => r.id === input.schoolClassId && r.tenantId === user.tenantId && r.academicYearId === input.academicYearId);
    if (!year || !term || !schoolClass) throw new Error('Select an academic year, term, and class from this school.');
    const now = new Date().toISOString(); const id = `fee-structure-${globalThis.crypto.randomUUID()}`; store.feeStructures.push({ id, tenantId: user.tenantId, name, academicYearId: year.id, termId: term.id, schoolClassId: schoolClass.id, status: 'ACTIVE', createdBy: user.id, createdAt: now, updatedAt: now });
    store.feeItems.push(...input.items.map((item) => ({ id: `fee-item-${globalThis.crypto.randomUUID()}`, tenantId: user.tenantId as string, feeStructureId: id, name: item.name.trim(), description: item.description?.trim() || undefined, amountMinor: item.amountMinor })));
    audit(store, user.id, user.tenantId, 'CREATE', 'FEE_STRUCTURE', id, { itemCount: input.items.length }); FinanceRepository.save(store); return id;
  }
  static createInvoice(input: { studentId: string; feeStructureId: string; dueOn: string }) {
    const user = actor(); assertPermission(permissions.financeManage); const store = FinanceRepository.read(); const student = store.students.find((s) => s.id === input.studentId && s.tenantId === user.tenantId); const structure = store.feeStructures.find((s) => s.id === input.feeStructureId && s.tenantId === user.tenantId && s.status === 'ACTIVE'); const enrollment = student && store.enrollments.find((e) => e.studentId === student.id && e.tenantId === user.tenantId && e.academicYearId === structure?.academicYearId && e.schoolClassId === structure?.schoolClassId && e.status === 'ACTIVE'); const items = structure && store.feeItems.filter((i) => i.feeStructureId === structure.id && i.tenantId === user.tenantId);
    if (!student || !structure || !enrollment || !items?.length || input.dueOn < new Date().toISOString().slice(0, 10)) throw new Error('Choose a student actively enrolled in the fee structure class and a valid future due date.');
    if (store.invoices.some((i) => i.studentId === student.id && i.feeStructureId === structure.id && !i.voidedAt)) throw new Error('An invoice already exists for this student and fee structure.');
    const issuedOn = new Date().toISOString().slice(0, 10); const invoiceNumber = nextCode('INV', store.invoices.filter((i) => i.tenantId === user.tenantId), 'invoiceNumber'); const id = `invoice-${globalThis.crypto.randomUUID()}`;
    store.invoices.push({ id, tenantId: user.tenantId, invoiceNumber, studentId: student.id, enrollmentId: enrollment.id, academicYearId: structure.academicYearId, termId: structure.termId, feeStructureId: structure.id, issuedOn, dueOn: input.dueOn, createdBy: user.id, createdAt: new Date().toISOString() });
    store.invoiceLineItems.push(...items.map((item) => ({ id: `invoice-line-${globalThis.crypto.randomUUID()}`, tenantId: user.tenantId as string, invoiceId: id, description: item.name, amountMinor: item.amountMinor })));
    store.studentCharges.push(...items.map((item) => ({ id: `charge-${globalThis.crypto.randomUUID()}`, tenantId: user.tenantId as string, studentId: student.id, enrollmentId: enrollment.id, feeStructureId: structure.id, feeItemId: item.id, description: item.name, amountMinor: item.amountMinor, createdAt: new Date().toISOString() })));
    notify(store, student.guardianId, user.tenantId, `New invoice: ${invoiceNumber}`, `A new school fee invoice is available.`, `/parent-children/${student.id}/fees`); audit(store, user.id, user.tenantId, 'CREATE', 'INVOICE', id, { invoiceNumber, studentId: student.id, amountMinor: items.reduce((n, item) => n + item.amountMinor, 0) }); FinanceRepository.save(store); return id;
  }
  static recordPayment(input: { invoiceId: string; amountMinor: number; paymentDate: string; method: PaymentMethod; notes?: string }) {
    const user = actor(); const parent = user.role === 'PARENT'; assertPermission(parent ? permissions.parentFeesView : permissions.financeManage); const store = FinanceRepository.read(); const invoice = store.invoices.find((i) => i.id === input.invoiceId && i.tenantId === user.tenantId); if (!invoice) throw new Error('Invoice not found.'); const student = store.students.find((row) => row.id === invoice.studentId && row.tenantId === user.tenantId && (!parent || row.guardianId === user.id)); if (!student) throw new AuthorizationError(); if (parent && !['CARD', 'MOBILE_MONEY'].includes(input.method)) throw new Error('Parents can simulate card or mobile money payments only.'); const view = viewInvoice(store, invoice);
    if (view.status === 'VOID' || view.outstandingMinor <= 0) throw new Error('This invoice cannot accept another payment.');
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0 || input.amountMinor > view.outstandingMinor) throw new Error('Payment must be greater than zero and no more than the outstanding balance.');
    if (!['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CARD'].includes(input.method)) throw new Error('Choose a supported payment method.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.paymentDate) || input.paymentDate > new Date().toISOString().slice(0, 10)) throw new Error('Enter a valid payment date that is not in the future.');
    const year = Number(input.paymentDate.slice(0, 4)); const receiptNumber = nextCode('RCPT', store.payments.filter((p) => p.tenantId === user.tenantId), 'receiptNumber', year); const reference = nextCode('PAY', store.payments.filter((p) => p.tenantId === user.tenantId), 'reference', year); const id = `payment-${globalThis.crypto.randomUUID()}`;
    store.payments.push({ id, tenantId: user.tenantId, receiptNumber, reference, invoiceId: invoice.id, studentId: invoice.studentId, amountMinor: input.amountMinor, paymentDate: input.paymentDate, method: input.method, status: 'RECORDED', recordedBy: user.id, channel: parent ? 'PARENT' : 'STAFF', notes: input.notes?.trim() || undefined, createdAt: new Date().toISOString() });
    notify(store, student.guardianId, user.tenantId, `Payment received: ${receiptNumber}`, `Your payment has been recorded.`, `/parent-children/${student.id}/fees/receipts/${id}`); audit(store, user.id, user.tenantId, 'CREATE', 'PAYMENT', id, { receiptNumber, reference, invoiceId: invoice.id, amountMinor: input.amountMinor, channel: parent ? 'PARENT' : 'STAFF' }); FinanceRepository.save(store); return id;
  }
  static createPaymentPlan(input: { invoiceId: string; cadence: PaymentPlanCadence; installmentCount: number }) { const user = actor(); const parent = user.role === 'PARENT'; assertPermission(parent ? permissions.parentFeesView : permissions.financeManage); const store = FinanceRepository.read(); const invoice = store.invoices.find((row) => row.id === input.invoiceId && row.tenantId === user.tenantId); if (!invoice) throw new Error('Invoice not found.'); const student = store.students.find((row) => row.id === invoice.studentId && row.tenantId === user.tenantId && (!parent || row.guardianId === user.id)); if (!student) throw new AuthorizationError(); if (!Number.isInteger(input.installmentCount) || input.installmentCount < 2 || input.installmentCount > 12) throw new Error('Choose between 2 and 12 installments.'); if (store.paymentPlans.some((plan) => plan.invoiceId === invoice.id && plan.status === 'ACTIVE')) throw new Error('This invoice already has an active payment plan.'); const outstanding = viewInvoice(store, invoice).outstandingMinor; const planId = `plan-${globalThis.crypto.randomUUID()}`; const now = new Date().toISOString(); const base = Math.floor(outstanding / input.installmentCount); const remainder = outstanding - base * input.installmentCount; store.paymentPlans.push({ id: planId, tenantId: user.tenantId, invoiceId: invoice.id, studentId: student.id, cadence: input.cadence, installmentCount: input.installmentCount, status: 'ACTIVE', createdBy: user.id, createdAt: now }); store.paymentInstallments.push(...Array.from({ length: input.installmentCount }, (_, index) => ({ id: `installment-${globalThis.crypto.randomUUID()}`, tenantId: user.tenantId, paymentPlanId: planId, invoiceId: invoice.id, installmentNumber: index + 1, dueOn: addMonths(invoice.dueOn, index), amountMinor: base + (index === 0 ? remainder : 0), paidMinor: 0, status: 'DUE' as const }))); audit(store, user.id, user.tenantId, 'CREATE', 'PAYMENT_PLAN', planId, { invoiceId: invoice.id, installmentCount: input.installmentCount }); FinanceRepository.save(store); return planId; }
  static addAdjustment(input: { invoiceId: string; type: FeeAdjustmentType; description: string; amountMinor: number }) { const user = actor(); assertPermission(permissions.financeManage); const store = FinanceRepository.read(); const invoice = store.invoices.find((row) => row.id === input.invoiceId && row.tenantId === user.tenantId); if (!invoice || !input.description.trim() || !Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0 || input.amountMinor > invoiceAmount(store, invoice.id)) throw new Error('Enter a valid adjustment within the invoice amount.'); const student = store.students.find((row) => row.id === invoice.studentId); const id = `adjustment-${globalThis.crypto.randomUUID()}`; store.feeAdjustments.push({ id, tenantId: user.tenantId, invoiceId: invoice.id, studentId: invoice.studentId, type: input.type, description: input.description.trim(), amountMinor: input.amountMinor, createdBy: user.id, createdAt: new Date().toISOString() }); audit(store, user.id, user.tenantId, 'CREATE', 'FEE_ADJUSTMENT', id, { invoiceId: invoice.id, amountMinor: input.amountMinor, type: input.type }); if (student) notify(store, student.guardianId, user.tenantId, `Fee adjustment: ${invoice.invoiceNumber}`, input.description.trim(), `/parent-children/${student.id}/fees`); FinanceRepository.save(store); return id; }
  static statement(studentId: string) { const user = actor(); const parent = user.role === 'PARENT'; assertPermission(parent ? permissions.parentFeesView : permissions.financeView); const store = FinanceRepository.read(); const student = store.students.find((row) => row.id === studentId && row.tenantId === user.tenantId && (!parent || row.guardianId === user.id)); if (!student) throw new AuthorizationError(); const invoices = store.invoices.filter((row) => row.studentId === studentId && row.tenantId === user.tenantId).map((invoice) => viewInvoice(store, invoice)); const entries = [...invoices.map((invoice) => ({ date: invoice.issuedOn, type: 'CHARGE', description: invoice.invoiceNumber, amountMinor: invoice.totalMinor })), ...store.payments.filter((payment) => payment.studentId === studentId && payment.tenantId === user.tenantId && payment.status === 'RECORDED').map((payment) => ({ date: payment.paymentDate, type: 'PAYMENT', description: payment.receiptNumber, amountMinor: -payment.amountMinor })), ...store.feeAdjustments.filter((adjustment) => adjustment.studentId === studentId && adjustment.tenantId === user.tenantId).map((adjustment) => ({ date: adjustment.createdAt.slice(0, 10), type: 'ADJUSTMENT', description: adjustment.description, amountMinor: -adjustment.amountMinor }))].sort((first, second) => second.date.localeCompare(first.date)); return { student, entries, balanceMinor: entries.reduce((sum, entry) => sum + entry.amountMinor, 0) }; }
  static reconciliationSummary(tenantId: string, store = FinanceRepository.read()) { const recorded = store.payments.filter((payment) => payment.tenantId === tenantId && payment.status === 'RECORDED'); const expected = recorded.reduce<Record<PaymentMethod, number>>((totals, payment) => ({ ...totals, [payment.method]: totals[payment.method] + payment.amountMinor }), { CASH: 0, BANK_TRANSFER: 0, MOBILE_MONEY: 0, CARD: 0, WALLET: 0 }); return { expected, records: store.reconciliations.filter((record) => record.tenantId === tenantId) }; }
  static reconcile(input: { reconciliationDate: string; method: PaymentMethod; recordedMinor: number }) { const user = actor(); assertPermission(permissions.financeManage); const store = FinanceRepository.read(); const expected = store.payments.filter((payment) => payment.tenantId === user.tenantId && payment.method === input.method && payment.status === 'RECORDED' && payment.paymentDate === input.reconciliationDate).reduce((sum, payment) => sum + payment.amountMinor, 0); const id = `reconciliation-${globalThis.crypto.randomUUID()}`; store.reconciliations.push({ id, tenantId: user.tenantId, reconciliationDate: input.reconciliationDate, method: input.method, expectedMinor: expected, recordedMinor: input.recordedMinor, varianceMinor: input.recordedMinor - expected, status: 'RECONCILED', reconciledBy: user.id, createdAt: new Date().toISOString() }); FinanceRepository.save(store); return id; }
  static voidInvoice(id: string, reason: string) { const user = actor(); assertPermission(permissions.financeManage); const store = FinanceRepository.read(); const invoice = store.invoices.find((i) => i.id === id && i.tenantId === user.tenantId); const note = reason.trim(); if (!invoice || invoiceStatus(store, invoice) === 'VOID' || paidAmount(store, id) > 0 || note.length < 10) throw new Error('An unpaid invoice and a reason of at least 10 characters are required.'); invoice.voidedAt = new Date().toISOString(); invoice.voidReason = note; audit(store, user.id, user.tenantId, 'UPDATE', 'INVOICE_VOIDED', id, { reason: note }); FinanceRepository.save(store); }
  static receipt(id: string) { const user = actor(); const store = FinanceRepository.read(); const payment = store.payments.find((p) => p.id === id && p.tenantId === user.tenantId && p.status === 'RECORDED'); if (!payment) throw new Error('Receipt not found.'); if (user.role === 'PARENT') { assertPermission(permissions.parentFeesView); const student = store.students.find((s) => s.id === payment.studentId && s.guardianId === user.id && s.tenantId === user.tenantId); if (!student) throw new AuthorizationError(); } else assertPermission(permissions.financeView); const invoice = store.invoices.find((i) => i.id === payment.invoiceId); if (!invoice) throw new Error('Invoice not found.'); audit(store, user.id, user.tenantId, 'CREATE', 'RECEIPT_VIEWED', payment.id, { receiptNumber: payment.receiptNumber }); FinanceRepository.save(store); return { payment, invoice: viewInvoice(store, invoice), student: store.students.find((s) => s.id === payment.studentId), school: store.settings.find((s) => s.tenantId === user.tenantId)?.institutionName ?? 'School' }; }
}

