import React, { useState, useEffect } from 'react';
import { Voucher } from '../types';
import { useAuth } from '../context/AuthContext';
import { SignaturePad } from '../components/SignaturePad';
import { X, Save, Send, AlertCircle, FileText, Check } from 'lucide-react';

interface VoucherFormModalProps {
  voucherToEdit?: Voucher | null;
  onClose: () => void;
  onSaveDraft: (data: any) => Promise<void>;
  onSubmitVoucher: (data: any) => Promise<void>;
}

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance & Accounts',
  'Operations',
  'Product Design',
  'Legal',
];

const CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Software & Subscriptions',
  'Training & Certifications',
  'Client Meeting',
  'Logistics',
  'Miscellaneous',
];

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  voucherToEdit,
  onClose,
  onSaveDraft,
  onSubmitVoucher,
}) => {
  const { user } = useAuth();

  const isEditing = Boolean(voucherToEdit);

  const [department, setDepartment] = useState(
    voucherToEdit?.department || user?.department || 'Engineering'
  );
  const [expenseTitle, setExpenseTitle] = useState(voucherToEdit?.expenseTitle || '');
  const [expenseCategory, setExpenseCategory] = useState(
    voucherToEdit?.expenseCategory || 'Travel'
  );
  const [expenseDescription, setExpenseDescription] = useState(
    voucherToEdit?.expenseDescription || ''
  );
  const [expenseDate, setExpenseDate] = useState(
    voucherToEdit?.expenseDate || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<string>(
    voucherToEdit?.amount ? String(voucherToEdit.amount) : ''
  );
  const [currency, setCurrency] = useState(voucherToEdit?.currency || 'USD');
  const [employeeSignature, setEmployeeSignature] = useState(
    voucherToEdit?.employeeSignature || user?.defaultSignature || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (requireSignature: boolean = false) => {
    const newErrors: Record<string, string> = {};

    if (!department || !department.trim()) {
      newErrors.department = 'Department is mandatory';
    }
    if (!expenseTitle || !expenseTitle.trim()) {
      newErrors.expenseTitle = 'Expense Title is mandatory';
    }
    if (!expenseCategory || !expenseCategory.trim()) {
      newErrors.expenseCategory = 'Expense Category is mandatory';
    }
    if (!expenseDate) {
      newErrors.expenseDate = 'Expense Date is mandatory';
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount is mandatory and must be greater than zero';
    }

    if (requireSignature && (!employeeSignature || !employeeSignature.trim())) {
      newErrors.employeeSignature =
        'Employee signature is mandatory before submitting for approval';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validate(false)) return;

    setIsSubmitting(true);
    try {
      await onSaveDraft({
        department,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        expenseDate,
        amount: parseFloat(amount),
        currency,
        employeeSignature,
      });
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err.message || 'Failed to save draft' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!validate(true)) return;

    setIsSubmitting(true);
    try {
      await onSubmitVoucher({
        department,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        expenseDate,
        amount: parseFloat(amount),
        currency,
        employeeSignature,
      });
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, form: err.message || 'Failed to submit voucher' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? `Edit Voucher ${voucherToEdit?.voucherNumber}` : 'Create New Expense Voucher'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update draft expense details prior to final submission'
                  : 'Submit a new reimbursement claim for Director review'}
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

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Section 1: Employee and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                disabled
                value={`${user?.name} (${user?.employeeId || 'EMP'})`}
                className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                  errors.department ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.department}</p>
              )}
            </div>
          </div>

          {/* Section 2: Expense Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Flight Tickets - Annual Tech Expo"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                  errors.expenseTitle ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.expenseTitle && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.expenseTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                  errors.expenseCategory ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.expenseCategory && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.expenseCategory}</p>
              )}
            </div>
          </div>

          {/* Section 3: Expense Date & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Expense Incurred Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                  errors.expenseDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.expenseDate && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.expenseDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 text-xs bg-white border rounded-lg text-slate-800 font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-slate-900 ${
                    errors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Expense Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Expense Description & Business Justification
            </label>
            <textarea
              rows={3}
              placeholder="Provide itemized details, business reason, vendor names, or project codes..."
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          {/* Section 5: Signature (Mandatory before submission) */}
          <div className="pt-2 border-t border-slate-200">
            <SignaturePad
              value={employeeSignature}
              onChange={setEmployeeSignature}
              label="Employee Digital Signature"
              required={true}
              signerName={user?.name}
              defaultSignature={user?.defaultSignature}
            />
            {errors.employeeSignature && (
              <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.employeeSignature}
              </p>
            )}
          </div>
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitForApproval}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit for Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
