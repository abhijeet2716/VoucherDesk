import React from 'react';
import { VoucherStatus, PaymentStatus } from '../types';
import { FileEdit, Clock, CheckCircle2, XCircle, CreditCard } from 'lucide-react';

interface StatusBadgeProps {
  status: VoucherStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (status) {
    case 'draft':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
        >
          <FileEdit className="w-3.5 h-3.5 text-slate-500" />
          Draft
        </span>
      );
    case 'pending_approval':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending Approval
        </span>
      );
    case 'approved':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-rose-50 text-rose-800 border border-rose-200/80 ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const PaymentBadge: React.FC<{ paymentStatus: PaymentStatus }> = ({ paymentStatus }) => {
  switch (paymentStatus) {
    case 'reimbursed':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <CreditCard className="w-3 h-3 text-emerald-600" />
          Reimbursed
        </span>
      );
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          Processing
        </span>
      );
    case 'unpaid':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Unpaid
        </span>
      );
  }
};
