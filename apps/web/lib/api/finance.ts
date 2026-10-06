import { apiClient } from "@/lib/api/client";

export interface CreateInvoiceRequest {
  academicYearId: string;
  termId: string;
  charges: { feeItemId: string; amount: number; description: string }[];
}

export interface RecordPaymentRequest {
  amount: number;
  paymentMethod: string;
  reference: string;
}

export async function fetchStudentInvoices(studentId: string) {
  return apiClient(`/finance/invoices/student/${studentId}`);
}

export async function fetchStudentPayments(studentId: string) {
  return apiClient(`/finance/payments/student/${studentId}`);
}

export async function postInvoice(studentId: string, data: CreateInvoiceRequest) {
  return apiClient(`/finance/invoices/student/${studentId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function postPayment(studentId: string, data: RecordPaymentRequest) {
  return apiClient(`/finance/payments/student/${studentId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
