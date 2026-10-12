export type UserRole = 'employee' | 'director' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  defaultSignature?: string;
  createdAt: string;
}

export type VoucherStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type PaymentStatus = 'unpaid' | 'processing' | 'reimbursed';

export interface AuditLog {
  id: string;
  voucherId: string;
  action: 'CREATED_DRAFT' | 'UPDATED_DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED' | 'DELETED';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  details?: string;
  createdAt: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  userId: string;
  employeeName: string;
  employeeId?: string;
  department: string;
  expenseTitle: string;
  expenseCategory: string;
  expenseDescription: string;
  expenseDate: string; // YYYY-MM-DD
  voucherDate: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  status: VoucherStatus;
  
  // Employee Signature
  employeeSignature?: string;
  employeeSignatureDate?: string;
  
  // Director Approval
  directorSignature?: string;
  approvalDate?: string;
  approvedById?: string;
  approvedByName?: string;
  rejectionReason?: string;
  
  // Accounts Team Payment processing
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentDate?: string;
  reimbursedById?: string;
  reimbursedByName?: string;
  
  // Audit
  createdAt: string;
  updatedAt: string;
  auditLogs: AuditLog[];
}

export interface VoucherFilterQuery {
  search?: string;
  voucherNumber?: string;
  employeeName?: string;
  department?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: 'voucherNumber' | 'voucherDate' | 'expenseDate' | 'amount' | 'status' | 'employeeName' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: string;
  limit?: string;
}
