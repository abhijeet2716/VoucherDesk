import React, { useRef } from 'react';
import { Voucher, UserRole } from '../types';
import { StatusBadge, PaymentBadge } from './StatusBadge';
import {
  X,
  Printer,
  Calendar,
  Building,
  User,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Receipt,
  Download,
} from 'lucide-react';

interface VoucherDetailModalProps {
  voucher: Voucher | null;
  onClose: () => void;
  userRole: UserRole;
  onApprove?: (voucher: Voucher) => void;
  onReject?: (voucher: Voucher) => void;
  onEdit?: (voucher: Voucher) => void;
  onSubmit?: (voucher: Voucher) => void;
  onDelete?: (voucher: Voucher) => void;
  onReimburse?: (voucher: Voucher) => void;
}

export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  voucher,
  onClose,
  userRole,
  onApprove,
  onReject,
  onEdit,
  onSubmit,
  onDelete,
  onReimburse,
}) => {
  const printContentRef = useRef<HTMLDivElement | null>(null);

  if (!voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <Receipt className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">
                  {voucher.voucherNumber}
                </h2>
                <StatusBadge status={voucher.status} />
              </div>
              <p className="text-xs text-slate-500">
                Created on {formatDate(voucher.createdAt)} · Last updated {formatDate(voucher.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              title="Print official expense voucher"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Official Printable Document Container */}
        <div className="p-6 overflow-y-auto space-y-6" ref={printContentRef}>
          {/* Printable Official Letterhead */}
          <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-xs space-y-6 print:border-black print:p-8">
            {/* Header / Company Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                  Apex Global Enterprises
                </div>
                <div className="text-xs text-slate-500">
                  Official Corporate Expense Reimbursement Voucher
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Corporate Finance Division · Tax & Audit ID: TAX-77492-X
                </div>
              </div>
              <div className="sm:text-right space-y-1">
                <div className="text-xs text-slate-500 font-medium">VOUCHER NUMBER</div>
                <div className="text-lg font-bold font-mono text-slate-900 tracking-wider">
                  {voucher.voucherNumber}
                </div>
                <div className="text-xs text-slate-500">
                  Date: <span className="font-semibold text-slate-800">{formatDate(voucher.voucherDate)}</span>
                </div>
              </div>
            </div>

            {/* Rejection Banner if Rejected */}
            {voucher.status === 'rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Voucher Rejected by Director
                </div>
                <p className="text-xs text-rose-900 leading-relaxed font-medium">
                  {voucher.rejectionReason || 'No specific remarks provided.'}
                </p>
                <div className="text-[11px] text-rose-600">
                  Reviewed by: {voucher.approvedByName || 'Director'} · {formatDateTime(voucher.approvalDate)}
                </div>
              </div>
            )}

            {/* 1. Basic & Employee Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Employee Name
                </span>
                <span className="font-bold text-slate-900 text-sm">{voucher.employeeName}</span>
                <span className="text-slate-500 block text-[11px] font-mono mt-0.5">
                  ID: {voucher.employeeId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Department
                </span>
                <span className="font-semibold text-slate-800 text-sm">{voucher.department}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Expense Date
                </span>
                <span className="font-semibold text-slate-800 text-sm">
                  {formatDate(voucher.expenseDate)}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Claim Amount
                </span>
                <span className="font-extrabold text-slate-900 text-base font-mono tabular-nums">
                  ${voucher.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-slate-500 block text-[11px]">Currency: {voucher.currency}</span>
              </div>
            </div>

            {/* 2. Expense Narrative & Category */}
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Expense Title & Purpose</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 align-top font-semibold text-slate-800">
                        {voucher.expenseCategory}
                      </td>
                      <td className="px-4 py-3 space-y-1 align-top">
                        <div className="font-bold text-slate-900 text-sm">
                          {voucher.expenseTitle}
                        </div>
                        {voucher.expenseDescription ? (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {voucher.expenseDescription}
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No description entered</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-right font-mono font-bold text-sm tabular-nums text-slate-900">
                        ${voucher.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-2.5 text-right text-slate-700">
                        Total Claimed Amount:
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-base text-slate-900 tabular-nums">
                        ${voucher.amount.toFixed(2)} {voucher.currency}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 3. Formal Signatures Verification Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Employee Signature Card */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Employee Signature
                  </span>
                  {voucher.employeeSignature ? (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">Pending Signature</span>
                  )}
                </div>

                <div className="h-24 bg-white border border-slate-200 rounded-md p-2 flex items-center justify-center overflow-hidden">
                  {voucher.employeeSignature ? (
                    <img
                      src={voucher.employeeSignature}
                      alt="Employee signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">Signature not yet provided</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>
                    Signed by: <strong className="text-slate-800">{voucher.employeeName}</strong>
                  </div>
                  <div>
                    Timestamp:{' '}
                    {voucher.employeeSignatureDate
                      ? formatDateTime(voucher.employeeSignatureDate)
                      : voucher.status !== 'draft'
                      ? formatDateTime(voucher.createdAt)
                      : 'Pending submission'}
                  </div>
                </div>
              </div>

              {/* Director Signature Card */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Director Approval
                  </span>
                  {voucher.status === 'approved' && voucher.directorSignature ? (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approved & Signed
                    </span>
                  ) : voucher.status === 'rejected' ? (
                    <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Awaiting Review</span>
                  )}
                </div>

                <div className="h-24 bg-white border border-slate-200 rounded-md p-2 flex items-center justify-center overflow-hidden">
                  {voucher.status === 'approved' && voucher.directorSignature ? (
                    <img
                      src={voucher.directorSignature}
                      alt="Director signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : voucher.status === 'rejected' ? (
                    <div className="text-center p-2">
                      <span className="text-xs font-bold text-rose-600 uppercase block">REJECTED</span>
                      <span className="text-[11px] text-slate-500 line-clamp-2">
                        {voucher.rejectionReason}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Pending Director Action</span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>
                    Approved By:{' '}
                    <strong className="text-slate-800">
                      {voucher.approvedByName || 'Director Office'}
                    </strong>
                  </div>
                  <div>
                    Approval Date:{' '}
                    {voucher.approvalDate ? formatDateTime(voucher.approvalDate) : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Team Reimbursement Status Section */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  3. Accounts Reimbursement Processing
                </div>
                <div className="text-slate-600">
                  {voucher.paymentStatus === 'reimbursed' ? (
                    <span>
                      Payment completed via Direct Deposit / Check (Ref:{' '}
                      <strong className="font-mono text-slate-900">{voucher.paymentReference}</strong>)
                      on {formatDateTime(voucher.paymentDate)} by {voucher.reimbursedByName}
                    </span>
                  ) : voucher.status === 'approved' ? (
                    <span className="text-amber-700 font-medium">
                      Queued for reimbursement payout by Accounts Team.
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      Awaiting executive director approval before reimbursement processing.
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <PaymentBadge paymentStatus={voucher.paymentStatus} />
              </div>
            </div>

            {/* 4. Complete Audit Trail History */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Voucher Audit Trail & History
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs divide-y divide-slate-100">
                {voucher.auditLogs && voucher.auditLogs.length > 0 ? (
                  voucher.auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <span>{log.actorName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                            {log.actorRole}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {log.details || log.action}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-slate-400 text-xs italic">No prior audit records.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Current Status: <strong className="text-slate-800 capitalize">{voucher.status.replace('_', ' ')}</strong>
          </div>

          <div className="flex items-center gap-2">
            {/* Employee Actions if Draft */}
            {userRole === 'employee' && voucher.status === 'draft' && (
              <>
                {onDelete && (
                  <button
                    onClick={() => onDelete(voucher)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Delete Draft
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(voucher)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    Edit Draft
                  </button>
                )}
                {onSubmit && (
                  <button
                    onClick={() => onSubmit(voucher)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                  >
                    Submit for Approval
                  </button>
                )}
              </>
            )}

            {/* Director Actions if Pending Approval */}
            {userRole === 'director' && voucher.status === 'pending_approval' && (
              <>
                {onReject && (
                  <button
                    onClick={() => onReject(voucher)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Reject Voucher...
                  </button>
                )}
                {onApprove && (
                  <button
                    onClick={() => onApprove(voucher)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                  >
                    Approve Voucher
                  </button>
                )}
              </>
            )}

            {/* Accounts Actions if Approved and Unpaid */}
            {userRole === 'accounts' && voucher.status === 'approved' && voucher.paymentStatus !== 'reimbursed' && onReimburse && (
              <button
                onClick={() => onReimburse(voucher)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
              >
                Process Reimbursement
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
