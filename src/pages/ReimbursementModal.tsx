import React, { useState } from 'react';
import { Voucher } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreditCard, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReimbursementModalProps {
  voucher: Voucher;
  onClose: () => void;
  onConfirmReimburse: (voucherId: string, paymentRef: string) => Promise<void>;
}

export const ReimbursementModal: React.FC<ReimbursementModalProps> = ({
  voucher,
  onClose,
  onConfirmReimburse,
}) => {
  const { user } = useAuth();
  const [paymentRef, setPaymentRef] = useState(
    `ACH-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!paymentRef.trim()) {
      setError('Payment Reference / Transaction ID is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmReimburse(voucher.id, paymentRef.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process reimbursement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Process Reimbursement</h2>
              <p className="text-xs text-slate-500 font-mono">
                {voucher.voucherNumber} · ${voucher.amount.toFixed(2)}
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Employee:</span>
              <span className="font-bold text-slate-800">{voucher.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expense:</span>
              <span className="text-slate-800">{voucher.expenseTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Claim Amount:</span>
              <span className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                ${voucher.amount.toFixed(2)} {voucher.currency}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Payment Reference / Transaction ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ACH-993812 or CHQ-0029"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Bank transaction number, wire confirmation, or check number.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark as Reimbursed
          </button>
        </div>
      </div>
    </div>
  );
};
