import React, { useState } from 'react';
import { Voucher } from '../types';
import { useAuth } from '../context/AuthContext';
import { SignaturePad } from '../components/SignaturePad';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  FileCheck2,
  Building,
  User,
  DollarSign,
} from 'lucide-react';

interface ApprovalModalProps {
  voucher: Voucher;
  initialMode?: 'approve' | 'reject';
  onClose: () => void;
  onConfirmApprove: (voucherId: string, directorSignature: string) => Promise<void>;
  onConfirmReject: (voucherId: string, rejectionReason: string) => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  voucher,
  initialMode = 'approve',
  onClose,
  onConfirmApprove,
  onConfirmReject,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'approve' | 'reject'>(initialMode);
  const [directorSignature, setDirectorSignature] = useState(user?.defaultSignature || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setError(null);
    if (!directorSignature || !directorSignature.trim()) {
      setError('Director signature is mandatory before approving this voucher');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmApprove(voucher.id, directorSignature);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setError(null);
    if (!rejectionReason || !rejectionReason.trim()) {
      setError('Rejection reason is mandatory when rejecting a voucher');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmReject(voucher.id, rejectionReason.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                mode === 'approve' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}
            >
              {mode === 'approve' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'approve' ? 'Approve Expense Voucher' : 'Reject Expense Voucher'}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {voucher.voucherNumber} · {voucher.employeeName} (${voucher.amount.toFixed(2)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Decision Toggle Tabs */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('approve');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'approve'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Approve Voucher
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reject');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'reject'
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            Reject Voucher
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Voucher Summary Card */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Expense Title:</span>
              <span className="font-bold text-slate-900">{voucher.expenseTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-medium text-slate-800">{voucher.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-medium text-slate-800">{voucher.expenseCategory}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Amount Claimed:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                ${voucher.amount.toFixed(2)} {voucher.currency}
              </span>
            </div>
            {voucher.expenseDescription && (
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                <span className="font-medium block text-slate-700 mb-0.5">Description:</span>
                {voucher.expenseDescription}
              </div>
            )}
          </div>

          {/* Employee Signature Verification Preview */}
          <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Employee Signature (Verified)
              </span>
              <span className="text-xs font-bold text-slate-800">{voucher.employeeName}</span>
            </div>
            {voucher.employeeSignature ? (
              <div className="h-10 w-28 bg-slate-50 border border-slate-200 rounded p-1 flex items-center justify-center">
                <img
                  src={voucher.employeeSignature}
                  alt="Employee signature"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <span className="text-xs text-rose-500">Missing</span>
            )}
          </div>

          {/* Mode-specific input */}
          {mode === 'approve' ? (
            <div className="pt-2 space-y-2">
              <div className="text-xs text-slate-600 font-medium">
                As the Director, your digital signature is required to finalize approval and route this voucher to Accounts for payment.
              </div>
              <SignaturePad
                value={directorSignature}
                onChange={setDirectorSignature}
                label="Director Digital Signature"
                required={true}
                signerName={`${user?.name} (Director)`}
                defaultSignature={user?.defaultSignature}
              />
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Rejection Reason & Remarks <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="State the explicit reason for rejection (e.g. Missing receipt, Exceeds per-diem policy limit, Incorrect cost code)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                This explanation will be permanently recorded and visible to the employee on their dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          {mode === 'approve' ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sign & Approve Voucher
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleReject}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Confirm Rejection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
