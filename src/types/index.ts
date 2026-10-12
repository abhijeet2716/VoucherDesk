export type UserRole = 'employee' | 'director' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  defaultSignature?: string;
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
  expenseDate: string;
  voucherDate: string;
  amount: number;
  currency: string;
  status: VoucherStatus;
  employeeSignature?: string;
  employeeSignatureDate?: string;
  directorSignature?: string;
  approvalDate?: string;
  approvedById?: string;
  approvedByName?: string;
  rejectionReason?: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paymentDate?: string;
  reimbursedById?: string;
  reimbursedByName?: string;
  createdAt: string;
  updatedAt: string;
  auditLogs: AuditLog[];
}

export interface VoucherFilterParams {
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  role: UserRole;
  // Employee stats
  draftVouchers?: number;
  pendingApproval?: number;
  approvedVouchers?: number;
  rejectedVouchers?: number;
  totalAmountClaimed?: number;
  totalVouchers?: number;
  recentVouchers?: Voucher[];

  // Director stats
  pendingApprovalCount?: number;
  approvedToday?: number;
  rejectedToday?: number;
  totalPendingAmount?: number;
  totalApprovedAmount?: number;
  recentActivity?: Voucher[];

  // Accounts stats
  reimbursedVouchers?: number;
  totalApprovedExpenseAmount?: number;
  totalReimbursedAmount?: number;
  recentApprovedVouchers?: Voucher[];
}
