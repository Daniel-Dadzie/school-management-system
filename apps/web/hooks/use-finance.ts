import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FinanceAdapter } from '@/lib/functional/adapters/finance-adapter';

export const financeKeys = { all: ['finance'] as const, invoices: ['finance', 'invoices'] as const, payments: ['finance', 'payments'] as const, references: ['finance', 'references'] as const, dashboard: ['finance', 'dashboard'] as const, student: (id: string) => ['finance', 'student', id] as const, receipt: (id: string) => ['finance', 'receipt', id] as const };
export const useFinanceReferences = () => useQuery({ queryKey: financeKeys.references, queryFn: FinanceAdapter.references });
export const useFinanceInvoices = () => useQuery({ queryKey: financeKeys.invoices, queryFn: FinanceAdapter.invoices });
export const useFinancePayments = () => useQuery({ queryKey: financeKeys.payments, queryFn: FinanceAdapter.payments });
export const useFinanceDashboard = () => useQuery({ queryKey: financeKeys.dashboard, queryFn: FinanceAdapter.dashboard });
export const useStudentFees = (id: string) => useQuery({ queryKey: financeKeys.student(id), queryFn: () => FinanceAdapter.studentFees(id), enabled: Boolean(id) });
export const useFinanceStatement = (id: string) => useQuery({ queryKey: ['finance', 'statement', id], queryFn: () => FinanceAdapter.statement(id), enabled: Boolean(id) });
export const useFinanceReceipt = (id: string) => useQuery({ queryKey: financeKeys.receipt(id), queryFn: () => FinanceAdapter.receipt(id), enabled: Boolean(id) });
const useFinanceMutation = <TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult> | TResult) => { const client = useQueryClient(); return useMutation({ mutationFn: async (input: TInput) => mutationFn(input), onSuccess: () => Promise.all([financeKeys.invoices, financeKeys.payments, financeKeys.dashboard, financeKeys.references].map((queryKey) => client.invalidateQueries({ queryKey }))) }); };
export const useCreateFeeStructure = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.createStructure>[0]) => FinanceAdapter.createStructure(input));
export const useCreateInvoice = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.createInvoice>[0]) => FinanceAdapter.createInvoice(input));
export const useRecordFinancePayment = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.recordPayment>[0]) => FinanceAdapter.recordPayment(input));
export const useVoidFinanceInvoice = () => useFinanceMutation((input: { id: string; reason: string }) => FinanceAdapter.voidInvoice(input.id, input.reason));
export const useCreatePaymentPlan = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.createPaymentPlan>[0]) => FinanceAdapter.createPaymentPlan(input));
export const useAddFeeAdjustment = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.addAdjustment>[0]) => FinanceAdapter.addAdjustment(input));
export const useReconcileFinance = () => useFinanceMutation((input: Parameters<typeof FinanceAdapter.reconcile>[0]) => FinanceAdapter.reconcile(input));
